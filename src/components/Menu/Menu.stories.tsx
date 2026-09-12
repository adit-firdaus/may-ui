import type { Meta, StoryObj } from '@storybook/react'
import {
  IoArrowUndoOutline,
  IoEllipsisHorizontal,
  IoFlagOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { useState } from 'react'
import { Menu } from '.'
import type { MenuItem } from '.'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

const mailActions: MenuItem[] = [
  { label: 'Reply', icon: <IoArrowUndoOutline aria-hidden />, shortcut: '⌘R', onSelect: () => {} },
  { label: 'Reply All', shortcut: '⇧⌘R', onSelect: () => {} },
  { label: 'Forward', shortcut: '⇧⌘F', onSelect: () => {} },
  { label: 'Flag', icon: <IoFlagOutline aria-hidden />, separator: true, onSelect: () => {} },
  { label: 'Mark as Unread', shortcut: '⇧⌘U', onSelect: () => {} },
  { label: 'Mute Thread', onSelect: () => {} },
  {
    label: 'Delete',
    icon: <IoTrashOutline aria-hidden />,
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
        <IoEllipsisHorizontal aria-hidden />
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
