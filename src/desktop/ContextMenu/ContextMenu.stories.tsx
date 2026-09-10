import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  IoArrowRedoOutline,
  IoArrowUndoOutline,
  IoCopyOutline,
  IoFlagOutline,
  IoOpenOutline,
  IoPricetagOutline,
  IoShareOutline,
  IoTimeOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { ContextMenu } from './ContextMenu'
import type { ContextMenuEntry, ContextMenuProps } from './ContextMenu'
import { List, ListRow } from '../../components/List/List'
import { Avatar } from '../../components/Avatar/Avatar'
import { Text } from '../../components/Text/Text'

const ICON = {
  open: <IoOpenOutline aria-hidden />,
  reply: <IoArrowUndoOutline aria-hidden />,
  forward: <IoArrowRedoOutline aria-hidden />,
  flag: <IoFlagOutline aria-hidden />,
  copy: <IoCopyOutline aria-hidden />,
  share: <IoShareOutline aria-hidden />,
  tag: <IoPricetagOutline aria-hidden />,
  trash: <IoTrashOutline aria-hidden />,
  clock: <IoTimeOutline aria-hidden />,
}

const mailMenu: ContextMenuEntry[] = [
  { id: 'open', label: 'Open in New Window', icon: ICON.open, shortcut: ['cmd', 'o'] },
  { type: 'separator' },
  { id: 'reply', label: 'Reply', icon: ICON.reply, shortcut: ['cmd', 'r'] },
  { id: 'reply-all', label: 'Reply All', icon: ICON.reply, shortcut: ['cmd', 'shift', 'r'] },
  { id: 'forward', label: 'Forward', icon: ICON.forward, shortcut: ['cmd', 'shift', 'f'] },
  { type: 'separator' },
  {
    id: 'flag',
    label: 'Flag',
    icon: ICON.flag,
    items: [
      { id: 'flag-red', label: 'Red', checked: true },
      { id: 'flag-orange', label: 'Orange', checked: false },
      { id: 'flag-yellow', label: 'Yellow', checked: false },
      { id: 'flag-green', label: 'Green', checked: false },
      { type: 'separator' },
      { id: 'flag-clear', label: 'Clear Flag' },
    ],
  },
  {
    id: 'remind',
    label: 'Remind Me',
    icon: ICON.clock,
    items: [
      { id: 'remind-hour', label: 'In 1 Hour' },
      { id: 'remind-tonight', label: 'Tonight' },
      { id: 'remind-tomorrow', label: 'Tomorrow' },
      { type: 'separator' },
      {
        id: 'remind-custom',
        label: 'Remind Me Later…',
        items: [
          { id: 'remind-weekend', label: 'This Weekend' },
          { id: 'remind-week', label: 'Next Week' },
          { id: 'remind-pick', label: 'Pick a Date…' },
        ],
      },
    ],
  },
  {
    id: 'move',
    label: 'Move to',
    icon: ICON.tag,
    items: [
      { id: 'move-archive', label: 'Archive' },
      { id: 'move-work', label: 'Work' },
      { id: 'move-receipts', label: 'Receipts' },
      { id: 'move-junk', label: 'Junk' },
    ],
  },
  { type: 'separator' },
  { id: 'mark-read', label: 'Mark as Unread', checked: false },
  { id: 'mute', label: 'Mute Thread', checked: true },
  { type: 'separator' },
  { id: 'trash', label: 'Move to Trash', icon: ICON.trash, shortcut: ['cmd', 'backspace'], destructive: true },
]

interface Message {
  id: string
  from: string
  subject: string
  preview: string
  at: string
}

const messages: Message[] = [
  { id: 'm1', from: 'Ada Lovelace', subject: 'Re: Analytical Engine notes', preview: 'The card sequence works — see the attached table.', at: '9:41 AM' },
  { id: 'm2', from: 'Apple', subject: 'Your receipt from Apple', preview: 'Logic Pro · $199.99 · Apple Account ada@icloud.com', at: '8:02 AM' },
  { id: 'm3', from: 'Grace Hopper', subject: 'Compiler review Thursday?', preview: 'Thursday at two works for me if it still works for you.', at: 'Yesterday' },
  { id: 'm4', from: 'TestFlight', subject: 'Aurora 2.4 (118) is ready to test', preview: 'This build expires in 90 days.', at: 'Yesterday' },
]

const meta = {
  title: 'Catalog/Desktop/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'padded' },
  args: {
    items: mailMenu,
    children: null,
  },
} satisfies Meta<ContextMenuProps>

export default meta
type Story = StoryObj<typeof meta>

function MailList({ items = mailMenu }: { items?: ContextMenuEntry[] }) {
  const [last, setLast] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: '34rem' }}>
      <List header="Inbox" footer={last ? `Last chosen: ${last}` : 'Right-click any message.'}>
        {messages.map((message) => (
          <ContextMenu
            key={message.id}
            items={items}
            label={`Actions for ${message.subject}`}
            onSelect={(item) => setLast(typeof item.label === 'string' ? item.label : item.id)}
          >
            <ListRow
              leading={<Avatar name={message.from} size="sm" />}
              title={message.from}
              subtitle={`${message.subject} — ${message.preview}`}
              detail={message.at}
              onClick={() => {}}
            />
          </ContextMenu>
        ))}
      </List>
    </div>
  )
}

/**
 * Right-click a message.
 *
 * The menu opens at the pointer and flips when it will not fit — try
 * right-clicking near the bottom or the right edge of the frame and watch which
 * corner it grows out of. *Flag*, *Remind Me* and *Move to* open on hover after
 * a beat; *Remind Me Later…* nests a third level inside the second.
 *
 * Everything works from the keyboard too: right-click, then arrow down, → to
 * open a submenu, ← or Escape to unwind one level at a time.
 */
export const Inbox: Story = {
  render: () => <MailList />,
}

const canvasMenu: ContextMenuEntry[] = [
  { type: 'label', label: 'Selection' },
  { id: 'copy', label: 'Copy', icon: ICON.copy, shortcut: ['cmd', 'c'] },
  { id: 'duplicate', label: 'Duplicate', shortcut: ['cmd', 'd'] },
  { id: 'share', label: 'Share…', icon: ICON.share, shortcut: ['cmd', 'shift', 's'] },
  { type: 'separator' },
  { type: 'label', label: 'Arrange' },
  { id: 'front', label: 'Bring to Front', shortcut: ['cmd', 'shift', 'up'] },
  { id: 'back', label: 'Send to Back', shortcut: ['cmd', 'shift', 'down'] },
  { id: 'lock', label: 'Lock', checked: false },
  { type: 'separator' },
  { id: 'paste', label: 'Paste', shortcut: ['cmd', 'v'], disabled: true },
  { id: 'delete', label: 'Delete', icon: ICON.trash, shortcut: ['backspace'], destructive: true },
]

/**
 * The full vocabulary in one menu: section labels, separators, icons, keycaps,
 * a checkbox item, a disabled row and a destructive one.
 *
 * Note the leading gutter — every row reserves it whether or not it has an icon
 * or a checkmark, so nothing shifts sideways when *Lock* is ticked.
 */
export const Vocabulary: Story = {
  render: () => (
    <ContextMenu items={canvasMenu} label="Canvas">
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '18rem',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
          color: 'var(--may-color-text-secondary)',
        }}
      >
        <Text tone="secondary">Right-click anywhere on this canvas</Text>
      </div>
    </ContextMenu>
  ),
}

/**
 * The dense rung. `sm` drops the row to the compact control height and the
 * subheadline size — right for a menu on a canvas or a timeline, where the
 * pointer is already precise and the menu is in the way of the work.
 */
export const Compact: Story = {
  render: () => (
    <ContextMenu items={canvasMenu} size="sm" label="Canvas">
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '18rem',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
          color: 'var(--may-color-text-secondary)',
        }}
      >
        <Text tone="secondary">Right-click for the compact menu</Text>
      </div>
    </ContextMenu>
  ),
}

/**
 * `disabled` hands the gesture back to the browser, which is the right answer
 * for a region where the user genuinely wants Inspect Element or Save Image As.
 * The wrapper is `display: contents`, so nothing about the row's layout changes
 * either way.
 */
export const PassThrough: Story = {
  render: () => (
    <div style={{ maxWidth: '34rem' }}>
      <List header="Inbox" footer="These rows pass right-click through to the browser.">
        {messages.slice(0, 2).map((message) => (
          <ContextMenu key={message.id} items={mailMenu} disabled>
            <ListRow title={message.from} subtitle={message.subject} detail={message.at} />
          </ContextMenu>
        ))}
      </List>
    </div>
  ),
}
