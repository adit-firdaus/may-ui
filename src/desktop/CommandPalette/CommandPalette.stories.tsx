import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  IoArchiveOutline,
  IoArrowUndoOutline,
  IoCloudOutline,
  IoCreateOutline,
  IoFlagOutline,
  IoMailOutline,
  IoMoonOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { CommandPalette } from '.'
import type { CommandGroup, CommandItem, CommandPaletteProps } from '.'
import { Button } from '../../components/Button'
import { Kbd } from '../../components/Kbd'
import { List, ListRow } from '../../components/List'

/* SF-Symbol-flavoured glyphs. Stroked, never filled, so they sit at the same
 * weight as the row's own text. */
const ICON = {
  compose: <IoCreateOutline aria-hidden />,
  mailbox: <IoMailOutline aria-hidden />,
  search: <IoSearchOutline aria-hidden />,
  flag: <IoFlagOutline aria-hidden />,
  archive: <IoArchiveOutline aria-hidden />,
  trash: <IoTrashOutline aria-hidden />,
  reply: <IoArrowUndoOutline aria-hidden />,
  person: <IoPersonOutline aria-hidden />,
  gear: <IoSettingsOutline aria-hidden />,
  moon: <IoMoonOutline aria-hidden />,
  cloud: <IoCloudOutline aria-hidden />,
}

const mailCommands: CommandGroup[] = [
  {
    id: 'message',
    heading: 'Message',
    items: [
      { id: 'compose', label: 'New Message', icon: ICON.compose, shortcut: ['cmd', 'n'], keywords: ['compose', 'write', 'draft'] },
      { id: 'reply', label: 'Reply', icon: ICON.reply, shortcut: ['cmd', 'r'] },
      { id: 'reply-all', label: 'Reply All', icon: ICON.reply, shortcut: ['cmd', 'shift', 'r'] },
      { id: 'flag', label: 'Flag Message', icon: ICON.flag, shortcut: ['cmd', 'shift', 'l'], keywords: ['mark', 'star'] },
      { id: 'archive', label: 'Archive', icon: ICON.archive, shortcut: ['ctrl', 'a'], hint: 'Move to All Mail' },
      { id: 'delete', label: 'Move to Trash', icon: ICON.trash, shortcut: ['cmd', 'backspace'], destructive: true, keywords: ['delete', 'bin', 'remove'] },
    ],
  },
  {
    id: 'mailboxes',
    heading: 'Go To Mailbox',
    items: [
      { id: 'inbox', label: 'Inbox', icon: ICON.mailbox, shortcut: ['cmd', '1'] },
      { id: 'vip', label: 'VIP', icon: ICON.person, shortcut: ['cmd', '2'], keywords: ['important', 'people'] },
      { id: 'sent', label: 'Sent', icon: ICON.mailbox, shortcut: ['cmd', '3'] },
      { id: 'junk', label: 'Junk', icon: ICON.mailbox, shortcut: ['cmd', '4'], keywords: ['spam'] },
    ],
  },
  {
    id: 'app',
    heading: 'Application',
    items: [
      { id: 'search', label: 'Search All Mailboxes', icon: ICON.search, shortcut: ['cmd', 'opt', 'f'], keywords: ['find', 'filter'] },
      { id: 'accounts', label: 'Accounts…', icon: ICON.cloud, hint: 'iCloud, Exchange, Google' },
      { id: 'appearance', label: 'Toggle Dark Appearance', icon: ICON.moon, keywords: ['theme', 'night', 'light'] },
      { id: 'settings', label: 'Settings…', icon: ICON.gear, shortcut: ['cmd', ','] },
      { id: 'rebuild', label: 'Rebuild Mailbox', icon: ICON.mailbox, disabled: true, hint: 'Select a mailbox first' },
    ],
  },
]

const meta = {
  title: 'Catalog/Desktop/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    groups: mailCommands,
  },
} satisfies Meta<CommandPaletteProps>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The palette open, waiting.
 *
 * Arrow through it and the selection moves without focus ever leaving the
 * query field. Type `mtt` and *Move to Trash* wins over *Toggle Dark
 * Appearance*, because its matched letters sit at word starts — the tinted
 * characters in each row are the ones that earned the hit.
 *
 * The caps in the footer are `live`, so holding a real ⌘ or ↩ lights them.
 */
export const Open: Story = {}

function RecentPalette() {
  const [open, setOpen] = useState(true)
  const [recent, setRecent] = useState<string[]>(['inbox', 'compose', 'flag'])
  const [last, setLast] = useState<CommandItem | null>(null)

  const run = (item: CommandItem) => {
    setLast(item)
    setRecent((ids) => [item.id, ...ids.filter((id) => id !== item.id)])
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-3)' }}>
        <Button onClick={() => setOpen(true)}>Open Palette</Button>
        <span style={{ color: 'var(--may-color-text-secondary)' }}>
          or press <Kbd live>cmd</Kbd> <Kbd live>k</Kbd>
        </span>
      </div>

      <div style={{ marginBlockStart: 'var(--may-space-6)', maxWidth: '28rem' }}>
        <List header="Recently used" footer={last ? `Last run: ${last.label}` : 'Nothing run yet.'}>
          {recent.map((id) => {
            const item = mailCommands.flatMap((group) => group.items).find((entry) => entry.id === id)
            return item ? <ListRow key={id} title={item.label} /> : null
          })}
        </List>
      </div>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={mailCommands}
        recentIds={recent}
        onSelect={run}
      />
    </>
  )
}

/**
 * Recents, and the global chord.
 *
 * With an empty query the three most recent commands are lifted to the top —
 * *lifted*, not copied: each one disappears from its own group so the same
 * command never occupies two rows. Run something and watch it move.
 *
 * ⌘K toggles: the chord that summons the palette also dismisses it.
 */
export const RecentAndHotkey: Story = {
  render: () => <RecentPalette />,
}

/** No match, and copy that says what was actually searched for. */
export const NoMatches: Story = {
  args: { query: 'zzzz', onQueryChange: () => {} },
}

const projectCommands: CommandGroup[] = [
  {
    id: 'quick',
    items: [
      { id: 'p1', label: 'Aurora — Design System', hint: 'Updated 2 min ago' },
      { id: 'p2', label: 'Aurora — iOS App', hint: 'Updated yesterday' },
      { id: 'p3', label: 'Borealis Marketing Site', hint: 'Updated last week' },
      { id: 'p4', label: 'Internal Tooling', hint: 'Updated 3 weeks ago' },
    ],
  },
]

/**
 * A single ungrouped list, no shortcuts, no footer — the quick-open shape,
 * where the palette is a jump list rather than a menu of verbs.
 */
export const QuickOpen: Story = {
  args: {
    groups: projectCommands,
    placeholder: 'Go to project',
    hideFooter: true,
    label: 'Projects',
  },
}
