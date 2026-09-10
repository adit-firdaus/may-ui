import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SwipeAction } from './SwipeAction'
import { List, ListRow } from '../../components/List'

const meta = {
  title: 'Catalog/Mobile/SwipeAction',
  component: SwipeAction,
  args: { children: null },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SwipeAction>

export default meta
type Story = StoryObj<typeof meta>

/* ------------------------------- glyphs ---------------------------------- */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const ArchiveIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path d="M3 6.5h14M4.5 6.5V16h11V6.5M3 6.5 4.6 4h10.8L17 6.5M8 10h4" {...stroke} />
  </svg>
)

const FlagIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path d="M5 17V3.5m0 0h9l-2 3 2 3H5" {...stroke} />
  </svg>
)

const MoreIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <circle cx="4.5" cy="10" r="1.4" fill="currentColor" />
    <circle cx="10" cy="10" r="1.4" fill="currentColor" />
    <circle cx="15.5" cy="10" r="1.4" fill="currentColor" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" {...stroke} />
    <path d="m3.5 6 6.5 4.5L16.5 6" {...stroke} />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path d="M4 6h12M8 6V4h4v2M6 6l.8 10h6.4L15 6M8.5 9v4M11.5 9v4" {...stroke} />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path d="M10 12.5V17M6.5 3h7l-1 5 2.5 2v1.5h-11V10L6.5 8z" {...stroke} />
  </svg>
)

/* -------------------------------- stories -------------------------------- */

interface Message {
  id: number
  from: string
  subject: string
  at: string
  unread: boolean
}

const INBOX: Message[] = [
  { id: 1, from: 'Ada Lovelace', subject: 'Re: Analytical Engine notes', at: '9:41 AM', unread: true },
  { id: 2, from: 'TestFlight', subject: 'Build 214 is ready to test', at: '8:02 AM', unread: false },
  { id: 3, from: 'Grace Hopper', subject: 'Compiler timings — down to 400ms', at: 'Yesterday', unread: true },
  { id: 4, from: 'Radar', subject: 'FB13391045 was resolved', at: 'Monday', unread: false },
]

/**
 * The Mail row. Drag left for Archive, Flag and More — they widen out of the
 * display edge together — or keep going: past halfway the other two fold up and
 * Archive takes the row, which fires on release. Drag right for Unread.
 */
export const Mail: Story = {
  render: () => {
    const [messages, setMessages] = useState(INBOX)
    const [log, setLog] = useState('Swipe a row.')
    const remove = (id: number, what: string) => {
      setMessages((current) => current.filter((message) => message.id !== id))
      setLog(`${what} — ${id}`)
    }

    return (
      <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
        <List header="Inbox" footer={log}>
          {messages.map((message) => (
            <SwipeAction
              key={message.id}
              leading={[
                {
                  label: message.unread ? 'Read' : 'Unread',
                  tone: 'tint',
                  icon: <MailIcon />,
                  onSelect: () =>
                    setMessages((current) =>
                      current.map((m) => (m.id === message.id ? { ...m, unread: !m.unread } : m)),
                    ),
                },
              ]}
              trailing={[
                { label: 'Archive', tone: 'tint', icon: <ArchiveIcon />, onSelect: () => remove(message.id, 'Archived') },
                { label: 'Flag', tone: 'warning', icon: <FlagIcon />, onSelect: () => setLog(`Flagged — ${message.id}`) },
                { label: 'More', tone: 'neutral', icon: <MoreIcon />, onSelect: () => setLog(`More — ${message.id}`) },
              ]}
            >
              <ListRow
                title={message.from}
                subtitle={message.subject}
                detail={message.at}
                onClick={() => setLog(`Opened — ${message.from}`)}
              />
            </SwipeAction>
          ))}
        </List>
      </div>
    )
  },
}

/**
 * One destructive action. A full swipe deletes without ever touching the tile —
 * the row travels all the way across first, so the deletion reads as something
 * that happened to the row rather than to a button.
 */
export const SwipeToDelete: Story = {
  render: () => {
    const [items, setItems] = useState([
      'Milk, oat if they have it',
      'Pick up the frame from the shop',
      'Book the ferry for the 14th',
      'Return the library books',
    ])

    return (
      <div style={{ maxWidth: 460 }}>
        <List header="Reminders" footer="Drag a row most of the way across to delete it.">
          {items.map((item, index) => (
            <SwipeAction
              key={item}
              trailing={[
                {
                  label: 'Delete',
                  tone: 'danger',
                  icon: <TrashIcon />,
                  onSelect: () => setItems((current) => current.filter((_, i) => i !== index)),
                },
              ]}
            >
              <ListRow title={item} />
            </SwipeAction>
          ))}
          {items.length === 0 && <ListRow title="All done" subtitle="Nothing left in this list" />}
        </List>
      </div>
    )
  },
}

/**
 * With `fullSwipe` off the row cannot be dragged past its actions — the end of
 * the group meets rubber-band resistance instead, so nothing fires by accident.
 */
export const NoFullSwipe: Story = {
  render: () => {
    const [log, setLog] = useState('Nothing fires until a tile is tapped.')
    return (
      <div style={{ maxWidth: 460 }}>
        <List header="Conversations" footer={log}>
          {['Katherine Johnson', 'Margaret Hamilton', 'Annie Easley'].map((name) => (
            <SwipeAction
              key={name}
              fullSwipe={false}
              leading={[{ label: 'Pin', tone: 'success', icon: <PinIcon />, onSelect: () => setLog(`Pinned ${name}`) }]}
              trailing={[
                { label: 'Delete', tone: 'danger', icon: <TrashIcon />, onSelect: () => setLog(`Deleted ${name}`) },
                { label: 'More', tone: 'neutral', icon: <MoreIcon />, onSelect: () => setLog(`More for ${name}`) },
              ]}
            >
              <ListRow title={name} subtitle="Tap the row — an open row closes instead" onClick={() => setLog(`Opened ${name}`)} />
            </SwipeAction>
          ))}
        </List>
      </div>
    )
  },
}

/** Every tone, and a row with nothing on one side — that side gives, then stops. */
export const Tones: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <List header="Tones" footer="The trailing side of the last row is empty: it rubber-bands and comes back.">
        {(['tint', 'success', 'warning', 'danger', 'neutral'] as const).map((tone) => (
          <SwipeAction
            key={tone}
            trailing={[{ label: tone, tone, icon: <FlagIcon />, onSelect: () => {} }]}
          >
            <ListRow title={tone} subtitle={`trailing: [{ tone: '${tone}' }]`} />
          </SwipeAction>
        ))}
        <SwipeAction leading={[{ label: 'Pin', tone: 'success', icon: <PinIcon />, onSelect: () => {} }]}>
          <ListRow title="Leading only" subtitle="Drag left and the row resists" />
        </SwipeAction>
      </List>
    </div>
  ),
}
