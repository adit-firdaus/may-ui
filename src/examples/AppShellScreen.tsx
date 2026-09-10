import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Sidebar, SidebarItem, SidebarSection, SidebarToggle } from '../desktop/Sidebar'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Breadcrumb } from '../components/Breadcrumb'
import { IconButton } from '../components/IconButton'
import { Menu } from '../components/Menu'
import { Table } from '../components/Table'
import type { TableColumn } from '../components/Table'
import { Text } from '../components/Text'
import { Tooltip } from '../components/Tooltip'

/* ------------------------------------------------------------------ *
 * Glyphs
 *
 * Drawn on the same 16px grid the Sidebar's own chevrons use, so a
 * mailbox icon and the section disclosure beside it share one optical
 * weight. Stroked rather than filled: a filled glyph at 24px reads a
 * full step heavier than the label next to it.
 *
 * Sizing is left to whoever slots it — every component that takes an
 * icon (Sidebar, IconButton, Breadcrumb, Menu) sizes `svg:not([width])`
 * itself. `style` is only for the one place a glyph sits loose in a
 * table cell with no slot to inherit from.
 * ------------------------------------------------------------------ */

const Glyph = ({ d, style }: { d: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false" style={style}>
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const icons = {
  inbox: 'M1.5 8.5h3l1 2h5l1-2h3M2 4.5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z',
  send: 'M14 2L7 9m7-7l-4.5 12-2.2-5.3L2 6.5z',
  draft: 'M4 2.5h5l3 3v8H4zM9 2.5v3h3',
  flag: 'M4 14V2.5h8l-1.6 3L12 8.5H4',
  unread: 'M2 4.5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2.4 5l5.6 4.2L13.6 5',
  clip: 'M10.5 4.5l-5 5a1.8 1.8 0 0 0 2.5 2.5l5.5-5.5a3.2 3.2 0 0 0-4.5-4.5L3 7.5',
  today: 'M2.5 4.5h11v9h-11zM2.5 7h11M5.5 2.5v3M10.5 2.5v3',
  folder: 'M2 4.5h4l1.2 1.5H14v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z',
  cloud: 'M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.7.6 2.7 2.7 0 0 1-.4 5.4z',
  compose: 'M13.5 8v4.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H8M11 2.2l2.8 2.8-5 5-3.3.5.5-3.3z',
  more: 'M4 8h.01M8 8h.01M12 8h.01',
}

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

interface Message {
  id: string
  sender: string
  subject: string
  preview: string
  date: string
  unread: boolean
  attachment?: string
}

const messages: Message[] = [
  {
    id: 'm1',
    sender: 'Ines Marchetti',
    subject: 'Re: Colour tokens for the dark build',
    preview: 'Separator is still a shade heavy at 2×. Everything else matches the spec now.',
    date: '9:41 AM',
    unread: true,
  },
  {
    id: 'm2',
    sender: 'Xcode Cloud',
    subject: 'Mercury 4.2 (118) passed all tests',
    preview: '412 tests in 6 min 04 s on macOS 15.2. Archive uploaded to TestFlight.',
    date: '8:12 AM',
    unread: true,
  },
  {
    id: 'm3',
    sender: 'Nadia Haddad',
    subject: 'Launch deck — final pass',
    preview: 'Slides 12 through 18 are rewritten. Everything else is where you left it.',
    date: 'Yesterday',
    unread: true,
    attachment: 'Keynote · 24.6 MB',
  },
  {
    id: 'm4',
    sender: 'Apple Developer',
    subject: 'Your annual membership renews on 4 October',
    preview: 'No action is needed. Your Apple Account ending in 4471 will be charged £79.',
    date: 'Yesterday',
    unread: false,
  },
  {
    id: 'm5',
    sender: 'Johan Persson',
    subject: 'Sidebar rail diagram for the docs',
    preview: 'Exported at 3×. Shout if you want the arrows a shade lighter in dark mode.',
    date: 'Monday',
    unread: false,
    attachment: 'PNG · 1.8 MB',
  },
  {
    id: 'm6',
    sender: 'Studio Booking',
    subject: 'Room 4 confirmed — Wed 14:00–16:00',
    preview: 'Added to your calendar. The display in there is a Studio Display, not a Pro XDR.',
    date: 'Monday',
    unread: false,
  },
  {
    id: 'm7',
    sender: 'Rebecca Moss',
    subject: 'Accessibility audit — first ten findings',
    preview: 'Draft attached. I kept the failure list short and moved the tables to the end.',
    date: '2 Sep',
    unread: false,
    attachment: 'PDF · 640 KB',
  },
  {
    id: 'm8',
    sender: 'Apple Support',
    subject: 'Case 101-8842119 was updated',
    preview: 'An engineer has replied about the notarisation timeout you reported on Friday.',
    date: '1 Sep',
    unread: false,
  },
]

/* The trailing date column: a mailbox lists times today and dates before it. */
const messageColumns: TableColumn<Message>[] = [
  {
    key: 'sender',
    header: 'From',
    primary: true,
    width: 200,
    render: (row) => (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--may-space-2)',
          minWidth: 0,
        }}
      >
        {/* A dot, not a count: one message is either read or it is not. */}
        <Badge dot tone="tint" style={{ visibility: row.unread ? undefined : 'hidden' }} />
        <Text
          as="span"
          variant="subheadline"
          weight={row.unread ? 'semibold' : undefined}
          clamp={1}
        >
          {row.sender}
        </Text>
      </span>
    ),
  },
  {
    key: 'subject',
    header: 'Subject',
    render: (row) => (
      <span style={{ display: 'grid', gap: 'var(--may-space-1)', minWidth: 0 }}>
        <Text as="span" variant="subheadline" weight={row.unread ? 'semibold' : undefined} clamp={1}>
          {row.subject}
        </Text>
        <Text as="span" variant="footnote" tone="secondary" clamp={1}>
          {row.preview}
        </Text>
      </span>
    ),
  },
  {
    key: 'attachment',
    header: 'Attachment',
    width: 156,
    render: (row) =>
      row.attachment ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--may-space-1)',
            color: 'var(--may-color-text-secondary)',
          }}
        >
          <Glyph
            d={icons.clip}
            style={{
              width: 'var(--may-space-4)',
              height: 'var(--may-space-4)',
              display: 'block',
              flexShrink: 0,
            }}
          />
          <Text as="span" variant="footnote" tone="secondary">
            {row.attachment}
          </Text>
        </span>
      ) : (
        /* An em dash, not a blank cell: blank reads as "still loading". */
        <Text as="span" variant="footnote" tone="tertiary">
          —
        </Text>
      ),
  },
  {
    key: 'date',
    header: 'Date',
    align: 'end',
    width: 112,
    render: (row) => (
      <Text as="span" variant="footnote" tone="secondary">
        {row.date}
      </Text>
    ),
  },
]

/* ------------------------------------------------------------------ *
 * Screen
 * ------------------------------------------------------------------ */

/**
 * The desktop app shell: a collapsing source list beside a content pane.
 *
 * The root deliberately carries NO transform. Sidebar's rail flyout is
 * `position: fixed` and measured off the real viewport, so any ancestor
 * with a transform would establish a containing block and strand the
 * label a few hundred pixels from the icon it belongs to.
 *
 * Collapse is controlled here rather than left to the Sidebar, because
 * the header's app title has to know about it too — a 4rem rail has
 * nowhere to put the word "Mailboxes", and letting it clip is the tell
 * that a rail was bolted on afterwards.
 */
export function AppShellScreen() {
  const [collapsed, setCollapsed] = useState(false)
  const [mailbox, setMailbox] = useState('inbox')
  const [openMessage, setOpenMessage] = useState('m1')

  const unread = messages.filter((message) => message.unread).length

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '34rem',
        background: 'var(--may-color-bg)',
      }}
    >
      <Sidebar
        aria-label="Mailboxes"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={
          <div
            style={{
              /* The header is itself a flex row, so this has to claim the
               * width before `space-between` means anything. */
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 'var(--may-space-2)',
            }}
          >
            {!collapsed && (
              <Text as="span" variant="headline" clamp={1}>
                Mail
              </Text>
            )}
            <SidebarToggle />
          </div>
        }
        footer={
          <SidebarItem
            /* An Avatar in the icon slot: xs is 0.55 of the control height,
             * which is the same 24px box the stroked glyphs above draw into,
             * so the account row does not sit a step taller than the rest. */
            icon={<Avatar name="Lena Fischer" size="xs" />}
            onClick={() => setMailbox('account')}
            active={mailbox === 'account'}
          >
            Lena Fischer
          </SidebarItem>
        }
      >
        <SidebarSection title="Favourites">
          <SidebarItem
            icon={<Glyph d={icons.inbox} />}
            badge={unread}
            active={mailbox === 'inbox'}
            onClick={() => setMailbox('inbox')}
          >
            Inbox
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.send} />}
            active={mailbox === 'sent'}
            onClick={() => setMailbox('sent')}
          >
            Sent
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.draft} />}
            badge={2}
            active={mailbox === 'drafts'}
            onClick={() => setMailbox('drafts')}
          >
            Drafts
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.flag} />}
            active={mailbox === 'flagged'}
            onClick={() => setMailbox('flagged')}
          >
            Flagged
          </SidebarItem>
        </SidebarSection>

        {/* Collapsible groups fold their items away — except on the rail,
         * where a folded group would be unreachable with no title to
         * unfold it. The Sidebar forces them open there and restores
         * this state when the rail reopens. */}
        <SidebarSection title="Smart Mailboxes" collapsible>
          <SidebarItem
            icon={<Glyph d={icons.unread} />}
            badge={unread}
            active={mailbox === 'unread'}
            onClick={() => setMailbox('unread')}
          >
            Unread
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.clip} />}
            active={mailbox === 'attachments'}
            onClick={() => setMailbox('attachments')}
          >
            Attachments
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.today} />}
            badge={4}
            active={mailbox === 'today'}
            onClick={() => setMailbox('today')}
          >
            Today
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="iCloud" collapsible defaultOpen={false}>
          <SidebarItem
            icon={<Glyph d={icons.folder} />}
            active={mailbox === 'receipts'}
            onClick={() => setMailbox('receipts')}
          >
            Receipts
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.folder} />}
            active={mailbox === 'travel'}
            onClick={() => setMailbox('travel')}
          >
            Travel
          </SidebarItem>
          <SidebarItem
            icon={<Glyph d={icons.folder} />}
            active={mailbox === 'archive'}
            onClick={() => setMailbox('archive')}
          >
            Archive
          </SidebarItem>
        </SidebarSection>
      </Sidebar>

      {/* The content pane. `minWidth: 0` is what lets the table's own
       * horizontal scroller take over instead of the flex row growing
       * past the window. */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          margin: 'var(--may-space-2)',
          marginInlineStart: 0,
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--may-space-4)',
            padding: 'var(--may-space-3) var(--may-space-4)',
            minWidth: 0,
          }}
        >
          <Breadcrumb
            aria-label="Mailbox"
            size="sm"
            items={[
              {
                label: 'iCloud',
                icon: <Glyph d={icons.cloud} />,
                onClick: () => setMailbox('archive'),
              },
              { label: 'Favourites', onClick: () => setMailbox('inbox') },
              { label: 'Inbox' },
            ]}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-1)' }}>
            <Text as="span" variant="footnote" tone="secondary">
              {unread} unread
            </Text>
            <Tooltip label="New Message ⌘N">
              <IconButton aria-label="New Message">
                <Glyph d={icons.compose} />
              </IconButton>
            </Tooltip>
            {/* Shortcuts are the real ones Mail uses, because a menu that
             * invents its own is the fastest way to look like a mock. */}
            <Menu
              aria-label="View options"
              placement="bottom-end"
              trigger={
                <IconButton aria-label="View options" tone="neutral">
                  <Glyph d={icons.more} />
                </IconButton>
              }
              items={[
                { label: 'Sort by Date', shortcut: '⌥⌘D' },
                { label: 'Sort by Sender' },
                { label: 'Sort by Subject' },
                { label: 'Group by Conversation', shortcut: '⌥⌘T', separator: true },
                { label: 'Mark All as Read', shortcut: '⇧⌘K' },
                { label: 'Move to Junk', destructive: true, separator: true },
              ]}
            />
          </div>
        </header>

        {/* The pane owns the scrollport, so `stickyHeader` has something to
         * pin against: an unbounded Table hands the job to its scrolling
         * ancestor rather than growing an inner one. */}
        <div
          data-slot="scroll-area"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 var(--may-space-4) var(--may-space-4)',
          }}
        >
          <Table
            columns={messageColumns}
            data={messages}
            rowKey="id"
            size="lg"
            stickyHeader
            selectedKeys={[openMessage]}
            onRowClick={(row) => setOpenMessage(row.id)}
          />
        </div>
      </main>
    </div>
  )
}
