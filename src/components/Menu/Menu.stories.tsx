import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Menu } from './Menu'
import type { MenuItem } from './Menu'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

const EllipsisIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden focusable="false">
    <circle cx="4.5" cy="10" r="1.6" />
    <circle cx="10" cy="10" r="1.6" />
    <circle cx="15.5" cy="10" r="1.6" />
  </svg>
)

const ReplyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M8 5L3.5 9.5 8 14M4 9.5h7.5a5 5 0 0 1 5 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const FlagIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M5 17V4.2c3-1.6 6-.4 9 0v7.6c-3-1.4-6-2.6-9 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M3.5 5.5h13M8 3.5h4M6 5.5V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const mailActions: MenuItem[] = [
  { label: 'Reply', icon: <ReplyIcon />, shortcut: '⌘R', onSelect: () => {} },
  { label: 'Reply All', shortcut: '⇧⌘R', onSelect: () => {} },
  { label: 'Forward', shortcut: '⇧⌘F', onSelect: () => {} },
  { label: 'Flag', icon: <FlagIcon />, separator: true, onSelect: () => {} },
  { label: 'Mark as Unread', shortcut: '⇧⌘U', onSelect: () => {} },
  { label: 'Mute Thread', onSelect: () => {} },
  {
    label: 'Delete',
    icon: <TrashIcon />,
    shortcut: '⌘⌫',
    destructive: true,
    separator: true,
    onSelect: () => {},
  },
]

const meta = {
  title: 'Catalog/Adaptive/Menu',
  component: Menu,
  args: {
    trigger: (
      <IconButton aria-label="More actions" variant="gray" round>
        <EllipsisIcon />
      </IconButton>
    ),
    items: mailActions,
    'aria-label': 'Message actions',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A Mail message's actions. Open it and use the keyboard: arrows rove and wrap,
 * Home and End jump the ends, typing "de" lands on Delete, and Escape closes and
 * puts focus back on the trigger. The pointer moves the same highlight, so
 * arriving by mouse and finishing by keyboard works.
 */
export const Default: Story = {}

/**
 * `separator` marks the item that *starts* a group, so the break is a property
 * of the list rather than a phantom entry the arrow keys have to step over.
 * Disabled items are skipped by both the arrows and type-ahead.
 */
export const Grouped: Story = {
  args: {
    trigger: <Button variant="gray">Edit</Button>,
    'aria-label': 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', onSelect: () => {} },
      { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
      { label: 'Cut', shortcut: '⌘X', separator: true, onSelect: () => {} },
      { label: 'Copy', shortcut: '⌘C', onSelect: () => {} },
      { label: 'Paste', shortcut: '⌘V', disabled: true },
      { label: 'Select All', shortcut: '⌘A', separator: true, onSelect: () => {} },
    ],
  },
}

/**
 * The menu prefers the side it is given and takes another when the viewport
 * says otherwise — near the trailing edge `bottom-start` shifts back inside,
 * and near the bottom the whole menu flips above its trigger.
 */
export const Placement: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--may-space-4)' }}>
      <Menu {...args} placement="bottom-start" trigger={<Button variant="gray">Start</Button>} />
      <Menu {...args} placement="bottom-end" trigger={<Button variant="gray">End</Button>} />
      <Menu {...args} placement="right-start" trigger={<Button variant="gray">Right</Button>} />
    </div>
  ),
}

/** Controlled, so the surrounding interface can reflect what was chosen. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    const [sort, setSort] = useState('Date')
    return (
      <div style={{ display: 'grid', gap: 'var(--may-space-3)', justifyItems: 'start' }}>
        <Menu
          {...args}
          open={open}
          onOpenChange={setOpen}
          aria-label="Sort by"
          trigger={<Button variant="tinted">Sort: {sort}</Button>}
          items={['Date', 'Sender', 'Subject', 'Size'].map((label) => ({
            label,
            onSelect: () => setSort(label),
          }))}
        />
        <span style={{ color: 'var(--may-color-text-secondary)', fontSize: 'var(--may-text-footnote)' }}>
          Menu is {open ? 'open' : 'closed'} · sorting by {sort}
        </span>
      </div>
    )
  },
}
