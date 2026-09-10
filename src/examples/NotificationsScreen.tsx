import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { NavigationBar } from '../components/NavigationBar'
import { NoticeBar } from '../components/NoticeBar'
import { Button } from '../components/Button'
import { List, ListRow } from '../components/List'
import { IconTile } from '../components/IconTile'
import type { IconTileGradient } from '../components/IconTile'
import { EmptyState } from '../components/EmptyState'
import { Badge } from '../components/Badge'
import { Text } from '../components/Text'
import { Stack } from '../components/Stack'
import { CapsuleTabs } from '../mobile/CapsuleTabs'

/**
 * Notification Centre.
 *
 * The whole screen is one scroll container, and the large title collapses into
 * the inline one against it — which is why `scrollRef` is threaded down to the
 * bar rather than left to listen on the window: inside a device frame the
 * window never scrolls at all, so a window listener would leave the title
 * permanently expanded.
 *
 * Grouping is the point of the layout. Six notices as six cards would read as
 * six unrelated things; one `List` per app, each with the app's name as its
 * header, is how iOS makes a morning's worth of alerts scannable.
 */

interface Notice {
  id: string
  /** Who or what sent it — the row's primary line. */
  title: string
  /** The message itself, clamped to one line by the row. */
  subtitle: string
  /** Relative for anything today, absolute once it is older. */
  time: string
  gradient: IconTileGradient
  glyph: ReactNode
  unread: boolean
}

interface NoticeGroup {
  /** Section header: the app, exactly as it is named on the Home Screen. */
  app: string
  footer?: string
  items: Notice[]
}

const GROUPS: NoticeGroup[] = [
  {
    app: 'Messages',
    items: [
      {
        id: 'msg-priya',
        title: 'Priya Raghunathan',
        subtitle: 'Landing at SFO around 6:40 — no need to leave early',
        time: '2m ago',
        gradient: 'green',
        glyph: <MessageGlyph />,
        unread: true,
      },
      {
        id: 'msg-crit',
        title: 'Design Crit',
        subtitle: 'Marcus: the sheet detent finally feels right on device',
        time: '18m ago',
        gradient: 'green',
        glyph: <MessageGlyph />,
        unread: true,
      },
    ],
  },
  {
    app: 'Security',
    footer: 'Sign-in alerts cannot be turned off for your Apple Account.',
    items: [
      {
        id: 'sec-signin',
        title: 'Apple Account',
        subtitle: 'New sign-in from MacBook Pro near Lisbon, Portugal',
        time: '9:41 AM',
        // Red is doing real work here: it is the one tile on the screen that
        // means "read me before the others", so nothing else may borrow it.
        gradient: 'red',
        glyph: <ShieldGlyph />,
        unread: true,
      },
      {
        id: 'sec-passwords',
        title: 'Passwords',
        subtitle: '3 saved passwords appeared in a known data leak',
        time: 'Yesterday',
        gradient: 'red',
        glyph: <KeyGlyph />,
        unread: true,
      },
    ],
  },
  {
    app: 'Mail',
    items: [
      {
        id: 'mail-dev',
        title: 'Apple Developer',
        subtitle: '“Fieldnotes 2.4” is now Ready for Sale',
        time: '1h ago',
        gradient: 'blue',
        glyph: <MailGlyph />,
        unread: true,
      },
      {
        id: 'mail-nadia',
        title: 'Nadia Whitcombe',
        subtitle: 'Re: Q3 roadmap — a few notes before Thursday',
        time: '3h ago',
        gradient: 'blue',
        glyph: <MailGlyph />,
        unread: false,
      },
    ],
  },
  {
    app: 'Home & Photos',
    items: [
      {
        id: 'home-door',
        title: 'Front Door',
        subtitle: 'Unlocked by Julian, then locked again at 4:12 PM',
        time: '5h ago',
        gradient: 'orange',
        glyph: <HouseGlyph />,
        unread: true,
      },
      {
        id: 'photos-memory',
        title: 'Memories',
        subtitle: '“Big Sur, Last October” is ready to watch',
        time: 'Yesterday',
        gradient: 'spectrum',
        glyph: <PhotosGlyph />,
        unread: false,
      },
    ],
  },
]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread', count: GROUPS.flatMap((g) => g.items).filter((n) => n.unread).length },
  { value: 'mentions', label: 'Mentions' },
]

export function NotificationsScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('all')
  const [cleared, setCleared] = useState(false)
  const [focusOn, setFocusOn] = useState(true)

  /* Filtering never rebuilds the groups — it drops rows and then drops any
   * group left empty, so an app that has nothing unread disappears entirely
   * instead of leaving a header with a hairline under it. */
  const groups = cleared
    ? []
    : GROUPS.map((group) => ({
        ...group,
        items: filter === 'unread' ? group.items.filter((n) => n.unread) : group.items,
      })).filter((group) => group.items.length > 0)

  const showMentions = filter === 'mentions'

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <NavigationBar
          title="Notifications"
          largeTitle
          scrollRef={scrollRef}
          trailing={
            <Button
              variant="plain"
              tone="tint"
              size="md"
              disabled={cleared}
              onClick={() => setCleared(true)}
            >
              Clear All
            </Button>
          }
        />

        <Stack
          direction="column"
          gap={4}
          style={{
            paddingInline: 'var(--may-space-4)',
            paddingBottom: 'calc(var(--may-inset-bottom) + var(--may-space-10))',
          }}
        >
          {focusOn && (
            <NoticeBar
              tone="warning"
              icon={<MoonGlyph />}
              onClose={() => setFocusOn(false)}
              closeLabel="Hide Focus notice"
              action={
                <Button variant="plain" tone="warning" size="sm" onClick={() => setFocusOn(false)}>
                  Turn Off
                </Button>
              }
            >
              Work Focus is on until 5:30 PM
            </NoticeBar>
          )}

          <CapsuleTabs
            items={FILTERS}
            value={filter}
            onValueChange={setFilter}
            aria-label="Filter notifications"
          />

          {showMentions ? (
            <EmptyState
              glyph={<AtGlyph />}
              title="No Mentions"
              description="When someone names you in a Messages thread or a shared note, it lands here — even while a Focus is on."
              action={
                <Button variant="tinted" size="md">
                  Mention Settings
                </Button>
              }
              style={{ paddingBlock: 'var(--may-space-12)' }}
            />
          ) : groups.length === 0 ? (
            <EmptyState
              glyph={<CheckGlyph />}
              title={cleared ? 'All Caught Up' : 'Nothing Unread'}
              description={
                cleared
                  ? 'Notifications you clear stay in Notification Centre for 30 days.'
                  : 'Everything from the last day has been read.'
              }
              style={{ paddingBlock: 'var(--may-space-12)' }}
            />
          ) : (
            groups.map((group) => (
              <List key={group.app} header={group.app} footer={group.footer}>
                {group.items.map((notice) => (
                  <ListRow
                    key={notice.id}
                    leading={
                      <IconTile gradient={notice.gradient} size="sm">
                        {notice.glyph}
                      </IconTile>
                    }
                    title={notice.title}
                    subtitle={notice.subtitle}
                    detail={
                      /* An inline-flex span, not a Stack: `detail` renders
                         inside a span, and a div nested in one is invalid
                         markup even though a browser will draw it. */
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--may-space-2)',
                        }}
                      >
                        {/* The dot is the unread mark, and it is hidden from
                            assistive tech: the row already reads out, and
                            "badge" spoken before every second title is noise. */}
                        {notice.unread && <Badge dot variant="solid" tone="tint" aria-hidden />}
                        {notice.time}
                      </span>
                    }
                    onClick={() => {}}
                  />
                ))}
              </List>
            ))
          )}

          {groups.length > 0 && !showMentions && (
            <Text variant="footnote" tone="tertiary" align="center">
              Notifications are grouped by app. Touch and hold a group to clear it.
            </Text>
          )}
        </Stack>
      </div>
    </div>
  )
}

/* ------------------------------- glyph set -------------------------------- */

function MessageGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.4c-5 0-9 3.3-9 7.4 0 2.4 1.4 4.5 3.5 5.8-.2 1.2-.8 2.4-1.8 3.4 1.9-.2 3.6-.9 4.9-2 .8.2 1.6.3 2.4.3 5 0 9-3.3 9-7.5s-4-7.4-9-7.4z"
        fill="currentColor"
      />
    </svg>
  )
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 7.2c0-1.3 1-2.2 2.3-2.2h13.4c1.3 0 2.3.9 2.3 2.2v9.6c0 1.3-1 2.2-2.3 2.2H5.3C4 19 3 18.1 3 16.8zM5.4 7l6.6 5.2L18.6 7z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.6l7 2.6v6.2c0 4.2-2.9 8-7 10.2-4.1-2.2-7-6-7-10.2V5.2zM11 8v5.4h2V8zm0 7v2h2v-2z"
        fill="currentColor"
      />
    </svg>
  )
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14.6 3.6a5.8 5.8 0 00-5.4 7.9L3 17.7V21h3.3l1.1-1.1v-1.8h1.8l1.4-1.4v-1.8h1.8l1.1-1.1a5.8 5.8 0 10.1-10.2zm2.1 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
        fill="currentColor"
      />
    </svg>
  )
}

function HouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3l9 7.6-1.3 1.6-1-.8V21H5.3v-9.6l-1 .8L3 10.6zm-1.4 10v6h2.8v-6z" fill="currentColor" />
    </svg>
  )
}

function PhotosGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 6.4c0-1.3 1-2.2 2.3-2.2h11.4c1.3 0 2.3.9 2.3 2.2v11.2c0 1.3-1 2.2-2.3 2.2H6.3C5 19.8 4 18.9 4 17.6zm2.2 10.4h11.6l-3.6-5-2.8 3.6-1.9-2.2zM8.4 9.6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        fill="currentColor"
      />
    </svg>
  )
}

/** The Focus glyph: the crescent Do Not Disturb has used since iOS 6. */
function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" fill="currentColor" />
    </svg>
  )
}

function AtGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.5a9.5 9.5 0 100 19v-2a7.5 7.5 0 117.5-7.5V13a1.5 1.5 0 01-3 0V7.5h-2v.9A4.5 4.5 0 1012 16.5a4.5 4.5 0 003.3-1.4 3.5 3.5 0 006.2-2.1V12A9.5 9.5 0 0012 2.5zm0 12a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zm4.9 6.9l-6 7.3-3.7-3.4 1.4-1.5 2.1 2 4.6-5.6z"
        fill="currentColor"
      />
    </svg>
  )
}
