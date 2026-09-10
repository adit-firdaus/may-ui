import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import {
  IoAtCircleOutline,
  IoChatbubble,
  IoCheckmarkCircleOutline,
  IoHome,
  IoImage,
  IoKey,
  IoMail,
  IoMoon,
  IoShield,
} from 'react-icons/io5'
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
  return <IoChatbubble aria-hidden />
}

function MailGlyph() {
  return <IoMail aria-hidden />
}

function ShieldGlyph() {
  return <IoShield aria-hidden />
}

function KeyGlyph() {
  return <IoKey aria-hidden />
}

function HouseGlyph() {
  return <IoHome aria-hidden />
}

function PhotosGlyph() {
  return <IoImage aria-hidden />
}

/** The Focus glyph: the crescent Do Not Disturb has used since iOS 6. */
function MoonGlyph() {
  return <IoMoon aria-hidden />
}

function AtGlyph() {
  return <IoAtCircleOutline aria-hidden />
}

function CheckGlyph() {
  return <IoCheckmarkCircleOutline aria-hidden />
}
