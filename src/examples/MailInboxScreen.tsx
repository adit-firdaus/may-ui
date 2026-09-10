import { useState } from 'react'
import {
  IoArchiveOutline,
  IoCreateOutline,
  IoFilterOutline,
  IoFlagOutline,
  IoMailOutline,
  IoTimeOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Fab } from '../components/Fab'
import { IconButton } from '../components/IconButton'
import { List, ListRow } from '../components/List'
import { Text } from '../components/Text'
import { Toolbar, ToolbarSpacer } from '../components/Toolbar'
import { NavBar } from '../mobile/NavBar'
import { PullToRefresh } from '../mobile/PullToRefresh'
import { SearchBar } from '../mobile/SearchBar'
import { SwipeAction } from '../mobile/SwipeAction'

/**
 * The Mail inbox — the screen that shows how three scroll-owning components
 * divide a phone up between them.
 *
 * The layout is three bands in a column, and which band scrolls is the whole
 * design: chrome at the top (nav bar plus search), `PullToRefresh` taking every
 * remaining pixel in the middle, and a toolbar at the bottom. `PullToRefresh`
 * **owns its scroller** — it renders the `overflow-y: auto` element itself and
 * translates it during the pull — so nothing above or below it may scroll, and
 * the `NavBar` above is deliberately `position="static"` rather than sticky:
 * there is no scroll container around it to stick to.
 *
 * Rows are `ListRow`s inside a `SwipeAction`, which is the composition Mail is
 * built on. The FIRST item on each side is the primary — the one that ends up
 * against the display edge and the one a full swipe fires — so Archive leads
 * the trailing group and Trash, being destructive, sits furthest from the
 * thumb's natural travel.
 */
export function MailInboxScreen() {
  const [messages, setMessages] = useState(INBOX)
  const [updated, setUpdated] = useState('Updated Just Now')
  const [flagged, setFlagged] = useState<string[]>(['reyes-budget'])

  const setRead = (id: string, read: boolean) =>
    setMessages((current) => current.map((m) => (m.id === id ? { ...m, unread: !read } : m)))

  const remove = (id: string) => setMessages((current) => current.filter((m) => m.id !== id))

  const toggleFlag = (id: string) =>
    setFlagged((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id],
    )

  const today = messages.filter((m) => m.group === 'today')
  const earlier = messages.filter((m) => m.group === 'earlier')
  const unread = messages.filter((m) => m.unread).length

  const row = (message: Message) => (
    <SwipeAction
      key={message.id}
      leading={[
        {
          label: message.unread ? 'Read' : 'Unread',
          tone: 'tint',
          icon: <IoMailOutline aria-hidden />,
          onSelect: () => setRead(message.id, message.unread),
        },
        { label: 'Remind', tone: 'neutral', icon: <IoTimeOutline aria-hidden />, onSelect: () => {} },
      ]}
      trailing={[
        /* First = primary = the one a full swipe fires. */
        { label: 'Archive', tone: 'tint', icon: <IoArchiveOutline aria-hidden />, onSelect: () => remove(message.id) },
        {
          label: flagged.includes(message.id) ? 'Unflag' : 'Flag',
          tone: 'warning',
          icon: <IoFlagOutline aria-hidden />,
          onSelect: () => toggleFlag(message.id),
        },
        { label: 'Trash', tone: 'danger', icon: <IoTrashOutline aria-hidden />, onSelect: () => remove(message.id) },
      ]}
    >
      <ListRow
        title={message.from}
        subtitle={message.subject}
        detail={message.at}
        /* A fixed-width status gutter on EVERY row, empty once a message has
         * been read. Giving the read rows the same empty gutter is what keeps
         * the senders on one vertical line — omitting it on those rows is the
         * usual reason an inbox looks ragged. Kept narrow deliberately: a
         * swiped row draws its own hairline from the card edge, so a wide
         * leading element would leave the rule hanging out past the text. */
        leading={
          <span
            style={{
              width: 'var(--may-space-3)',
              display: 'inline-flex',
              justifyContent: 'center',
            }}
          >
            {message.unread && <Badge dot aria-label="Unread" />}
            {!message.unread && flagged.includes(message.id) && (
              <Badge dot tone="warning" aria-label="Flagged" />
            )}
          </span>
        }
        onClick={() => setRead(message.id, true)}
      />
    </SwipeAction>
  )

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        /* The FAB is positioned against this, so it can clear the toolbar
         * instead of being pinned to the bottom of the frame. */
        position: 'relative',
        background: 'var(--may-color-bg)',
      }}
    >
      <div style={{ flexShrink: 0, background: 'var(--may-color-surface)' }}>
        <NavBar
          position="static"
          separator={false}
          title="Inbox"
          backLabel="Mailboxes"
          onBack={() => {}}
          trailing={
            <Button variant="plain" size="sm">
              Edit
            </Button>
          }
        />
        <SearchBar placeholder="Search" aria-label="Search all mailboxes" />
      </div>

      <PullToRefresh
        style={{ flex: 1, minHeight: 0 }}
        onRefresh={async () => {
          /* A promise, not a duration: the ring holds until the work settles,
           * which is the difference between a spinner and a progress report. */
          await new Promise((resolve) => setTimeout(resolve, 1200))
          setUpdated('Updated Just Now')
          setMessages((current) => [NEW_MAIL, ...current])
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-2)',
            /* Room under the last row for the FAB to float over. */
            padding: 'var(--may-space-2) var(--may-space-4) var(--may-space-16)',
          }}
        >
          {/* Guarded, because an empty `List` still draws its card — a header
              sitting over a blank rounded rectangle is the tell that a screen
              was only ever tested with data in it. */}
          {today.length > 0 && (
            <List header="Today" footer={unread === 0 ? 'No unread messages.' : undefined}>
              {today.map(row)}
            </List>
          )}
          {earlier.length > 0 && (
            <List header="Earlier" footer="Swipe a message for Archive, Flag and Trash.">
              {earlier.map(row)}
            </List>
          )}
          {messages.length === 0 && (
            <EmptyState
              glyph={<IoMailOutline aria-hidden />}
              title="No Mail"
              description="Everything has been archived. Pull down to check for new messages."
            />
          )}
        </div>
      </PullToRefresh>

      <Toolbar placement="bottom" separator safeArea>
        <IconButton aria-label="Filter by unread" onClick={() => setUpdated(`Filtered · ${unread} unread`)}>
          <IoFilterOutline aria-hidden />
        </IconButton>
        <ToolbarSpacer />
        <Text variant="caption-1" tone="secondary" as="span">
          {updated}
        </Text>
        <ToolbarSpacer />
      </Toolbar>

      {/* Not `fixed`: a fixed FAB resolves against the device frame and would
          land on top of the toolbar. Absolute, offset by one toolbar height. */}
      <div
        style={{
          position: 'absolute',
          insetInlineEnd: 'var(--may-space-5)',
          insetBlockEnd:
            'calc(var(--may-control-h) + var(--may-inset-bottom) + var(--may-space-4) + var(--may-space-4))',
          zIndex: 'var(--may-z-nav)',
        }}
      >
        <Fab icon={<IoCreateOutline aria-hidden />} aria-label="New Message" />
      </div>
    </div>
  )
}

/* --------------------------------- content -------------------------------- */

interface Message {
  id: string
  from: string
  subject: string
  at: string
  unread: boolean
  group: 'today' | 'earlier'
}

const INBOX: Message[] = [
  {
    id: 'reyes-budget',
    from: 'Daniela Reyes',
    subject: 'Q4 budget — one line item left to sign off',
    at: '9:41 AM',
    unread: true,
    group: 'today',
  },
  {
    id: 'testflight',
    from: 'TestFlight',
    subject: 'May UI 1.2 (build 214) is ready to test',
    at: '8:26 AM',
    unread: true,
    group: 'today',
  },
  {
    id: 'okonkwo',
    from: 'Tobenna Okonkwo',
    subject: 'Re: Milestone 3 review — notes from Thursday',
    at: '7:58 AM',
    unread: false,
    group: 'today',
  },
  {
    id: 'appstore',
    from: 'App Store',
    subject: 'Your receipt — Things 3, £49.99',
    at: 'Yesterday',
    unread: false,
    group: 'earlier',
  },
  {
    id: 'hsu',
    from: 'Mei-Lin Hsu',
    subject: 'Ferry tickets for the 14th are booked',
    at: 'Yesterday',
    unread: true,
    group: 'earlier',
  },
  {
    id: 'radar',
    from: 'Feedback Assistant',
    subject: 'FB13391045 was resolved in the latest seed',
    at: 'Monday',
    unread: false,
    group: 'earlier',
  },
  {
    id: 'lindqvist',
    from: 'Anders Lindqvist',
    subject: 'Type scale: switching headline to 17/22',
    at: 'Monday',
    unread: false,
    group: 'earlier',
  },
]

/** What the refresh pulls down. */
const NEW_MAIL: Message = {
  id: 'iimura',
  from: 'Saoirse Iimura',
  subject: 'Design review moved to 2:30 — same room',
  at: 'now',
  unread: true,
  group: 'today',
}
