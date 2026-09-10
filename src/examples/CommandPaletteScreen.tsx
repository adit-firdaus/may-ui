import type { ReactNode } from 'react'
import { useState } from 'react'

import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Kbd } from '../components/Kbd'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { Toolbar } from '../components/Toolbar'
import { CommandPalette } from '../desktop/CommandPalette'
import type { CommandGroup } from '../desktop/CommandPalette'
import { Sidebar, SidebarItem, SidebarSection, SidebarToggle } from '../desktop/Sidebar'

/* -------------------------------- glyph set -------------------------------- */

/** Stroked, never filled, so a glyph sits at the weight of the text beside it. */
const glyph = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ICON = {
  compose: glyph('M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z'),
  reply: glyph('M9 8 4 12l5 4m-5-4h9a7 7 0 0 1 7 7v1'),
  replyAll: glyph('M8 7 3 11l5 4m5-8-5 4 5 4m-5-4h6a7 7 0 0 1 7 7v1'),
  forward: glyph('M15 8l5 4-5 4m5-4h-9a7 7 0 0 0-7 7v1'),
  inbox: glyph('M3 13h5l1.5 3h5L16 13h5M4 5h16l1 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z'),
  sent: glyph('M21 3 10 14M21 3l-7 18-3.6-7.4L3 10Z'),
  drafts: glyph('M5 3h9l5 5v13H5zM14 3v5h5M8.5 13h7m-7 3.5h4'),
  gear: glyph('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9-3-2 .6-.6 1.5 1 1.8-2 2-1.8-1-1.5.6L12 21l-.6-2-1.5-.6-1.8 1-2-2 1-1.8L6.5 14 4.5 12l2-.6.6-1.5-1-1.8 2-2 1.8 1 1.5-.6L12 4l.6 2 1.5.6 1.8-1 2 2-1 1.8.6 1.5 2 .6Z'),
  moon: glyph('M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z'),
  trash: glyph('M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13'),
  command: glyph('M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z'),
}

/* Sidebar chrome sits on the 16px grid, like the rest of the window furniture. */
const rail = (d: string): ReactNode => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RAIL = {
  inbox: rail('M1.5 8.5h3l1 2h5l1-2h3M2 4.5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z'),
  star: rail('M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2 4.4 13.1l.7-4L2.2 6.3l4-.6z'),
  flag: rail('M4 14V2.5h8l-1.6 3L12 8.5H4'),
  drafts: rail('M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3'),
  send: rail('M14 2L7 9m7-7l-4.5 12-2.2-5.3L2 6.5z'),
  archive: rail('M2 5.5h12V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM1.5 2.5h13v3h-13zM6.5 8.5h3'),
  trash: rail('M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5'),
  gear: rail('M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 1.5l1 1.7 1.9-.4.4 1.9 1.7 1-1 1.7 1 1.7-1.7 1-.4 1.9-1.9-.4-1 1.7-1-1.7-1.9.4-.4-1.9-1.7-1 1-1.7-1-1.7 1.7-1 .4-1.9 1.9.4z'),
}

/**
 * Every row the palette can run.
 *
 * `keywords` are matched but never shown: "bin" and "delete" both have to find
 * *Move to Trash*, because that is what people type when they mean it.
 */
const GROUPS: CommandGroup[] = [
  {
    id: 'actions',
    heading: 'Actions',
    items: [
      { id: 'compose', label: 'New Message', icon: ICON.compose, shortcut: ['cmd', 'n'], keywords: ['write', 'draft'] },
      { id: 'reply', label: 'Reply', icon: ICON.reply, shortcut: ['cmd', 'r'] },
      { id: 'reply-all', label: 'Reply All', icon: ICON.replyAll, shortcut: ['cmd', 'shift', 'r'] },
      { id: 'forward', label: 'Forward', icon: ICON.forward, shortcut: ['cmd', 'shift', 'f'] },
      {
        id: 'trash',
        label: 'Move to Trash',
        icon: ICON.trash,
        shortcut: ['cmd', 'backspace'],
        destructive: true,
        keywords: ['delete', 'bin', 'remove'],
      },
    ],
  },
  {
    id: 'navigation',
    heading: 'Navigation',
    items: [
      { id: 'go-inbox', label: 'Go to Inbox', icon: ICON.inbox, shortcut: ['cmd', '1'], hint: '12 unread' },
      { id: 'go-sent', label: 'Go to Sent', icon: ICON.sent, shortcut: ['cmd', '2'] },
      { id: 'go-drafts', label: 'Go to Drafts', icon: ICON.drafts, shortcut: ['cmd', '3'], hint: '2 drafts' },
    ],
  },
  {
    id: 'settings',
    heading: 'Settings',
    items: [
      { id: 'preferences', label: 'Preferences…', icon: ICON.gear, shortcut: ['cmd', ','] },
      { id: 'theme', label: 'Toggle Theme', icon: ICON.moon, keywords: ['dark', 'light', 'appearance'] },
    ],
  },
]

const MAILBOXES = [
  { id: 'inbox', label: 'Inbox', icon: RAIL.inbox, badge: 12 as ReactNode },
  { id: 'vip', label: 'VIP', icon: RAIL.star, badge: 3 as ReactNode },
  { id: 'flagged', label: 'Flagged', icon: RAIL.flag, badge: undefined },
  { id: 'drafts', label: 'Drafts', icon: RAIL.drafts, badge: 2 as ReactNode },
  { id: 'sent', label: 'Sent', icon: RAIL.send, badge: undefined },
]

/**
 * A command palette over a working app.
 *
 * The palette paints its own scrim, so the Mail window behind it dims without
 * the screen having to stage anything — the backdrop is a real sidebar and a
 * real reading pane, not a grey rectangle, because a launcher's whole job is to
 * sit on top of work in progress.
 *
 * `hotkey={false}` gives the shortcut back to the host: this screen lives
 * inside a gallery that owns ⌘K itself, and a palette that silently steals a
 * chord from the page embedding it is the bug every launcher ships once. The
 * button in the toolbar reopens it, so dismissing the palette leaves something
 * to press rather than a dead screen.
 */
export function CommandPaletteScreen() {
  const [open, setOpen] = useState(true)
  const [mailbox, setMailbox] = useState('inbox')
  /** Most recent first — the palette lifts these into a Recent group. */
  const [recent, setRecent] = useState<string[]>(['reply', 'go-inbox', 'theme'])
  const [ran, setRan] = useState<string | null>(null)

  return (
    <div
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        background: 'var(--may-color-bg)',
      }}
    >
      <Sidebar
        aria-label="Mailboxes"
        header={<SidebarToggle />}
        footer={
          <SidebarItem icon={RAIL.gear} onClick={() => setOpen(true)}>
            Commands…
          </SidebarItem>
        }
      >
        <SidebarSection title="Favourites">
          {MAILBOXES.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              badge={item.badge}
              active={mailbox === item.id}
              onClick={() => setMailbox(item.id)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSection title="iCloud">
          <SidebarItem
            icon={RAIL.archive}
            active={mailbox === 'archive'}
            onClick={() => setMailbox('archive')}
          >
            Archive
          </SidebarItem>
          <SidebarItem
            icon={RAIL.trash}
            active={mailbox === 'bin'}
            onClick={() => setMailbox('bin')}
          >
            Bin
          </SidebarItem>
        </SidebarSection>
      </Sidebar>

      {/* The reading pane: an inset card, the way every macOS app frames content
        * beside a sidebar. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          margin: 'var(--may-space-2)',
          marginInlineStart: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
        }}
      >
        <Toolbar placement="top" separator align="between" variant="surface">
          <Text variant="headline">Inbox</Text>
          <Stack direction="row" gap={3} align="center">
            {/* `live` caps light when the real key is held, which turns a hint
              * into something you can check yourself against. */}
            <Stack direction="row" gap={1} align="center">
              <Text variant="footnote" tone="tertiary">
                Reply
              </Text>
              <Kbd live>cmd</Kbd>
              <Kbd live>r</Kbd>
            </Stack>
            <Button
              variant="gray"
              size="sm"
              leadingIcon={ICON.command}
              onClick={() => setOpen(true)}
            >
              Commands
            </Button>
          </Stack>
        </Toolbar>

        <div
          data-slot="scroll-area"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: 'var(--may-space-6)',
          }}
        >
          <Stack direction="column" gap={5} style={{ maxWidth: '44rem' }}>
            <Text variant="title-2">Re: compiler timings</Text>

            <Stack direction="row" gap={3} align="center">
              <Avatar name="Grace Hopper" size="md" />
              <Stack direction="column" gap={0}>
                <Text variant="subheadline" weight="semibold">
                  Grace Hopper
                </Text>
                <Text variant="footnote" tone="tertiary">
                  To: Ada Lovelace, Katherine Johnson — Today at 9:41 AM
                </Text>
              </Stack>
            </Stack>

            <Text variant="body">
              Timings attached. The linker is still the long pole at 41 seconds cold, and about
              nine of those are spent re-reading symbols we already have on disk.
            </Text>
            <Text variant="body">
              I have a patch that halves it by caching the symbol table between runs, but it wants
              a proper review before Friday — it touches the incremental path, and that is the one
              place we cannot be clever without paying for it later.
            </Text>
            <Text variant="body" tone="secondary">
              Grace
            </Text>

            <Text variant="footnote" tone="tertiary">
              {ran ? `Last command: ${ran}` : 'Press Commands, or ⌘K in a real window, to run anything from here.'}
            </Text>
          </Stack>
        </div>
      </div>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={GROUPS}
        // The host owns ⌘K here — see the note on the component.
        hotkey={false}
        recentIds={recent}
        placeholder="Search commands in Mail"
        label="Mail commands"
        onSelect={(item) => {
          setRan(item.label)
          // Whatever just ran becomes the newest Recent — and only ever appears
          // there once, because the palette lifts a recent item out of its own
          // group rather than copying it.
          setRecent((ids) => [item.id, ...ids.filter((id) => id !== item.id)].slice(0, 5))
          if (item.id === 'go-inbox') setMailbox('inbox')
          if (item.id === 'go-sent') setMailbox('sent')
          if (item.id === 'go-drafts') setMailbox('drafts')
        }}
        emptyState={
          <EmptyState
            size="sm"
            title="No Commands"
            description="Nothing matches. Try “reply”, “inbox”, or “theme”."
          />
        }
      />
    </div>
  )
}
