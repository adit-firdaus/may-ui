import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  IoArchiveOutline,
  IoBrowsersOutline,
  IoBrushOutline,
  IoCodeOutline,
  IoCreateOutline,
  IoDocumentOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoFileTrayOutline,
  IoFolderOutline,
  IoInformationCircleOutline,
  IoMoonOutline,
  IoPaperPlaneOutline,
  IoPencilOutline,
  IoSettingsOutline,
  IoStarOutline,
  IoTrashOutline,
} from 'react-icons/io5'

import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { List, ListRow } from '../components/List'
import { Separator } from '../components/Separator'
import { Text } from '../components/Text'
import { CommandPalette } from '../desktop/CommandPalette'
import type { CommandGroup } from '../desktop/CommandPalette'
import { ContextMenu } from '../desktop/ContextMenu'
import type { ContextMenuEntry } from '../desktop/ContextMenu'
import { DataTable } from '../desktop/DataTable'
import type { DataTableColumn } from '../desktop/DataTable'
import { NavTree } from '../desktop/NavTree'
import type { NavTreeNode } from '../desktop/NavTree'
import { Sidebar, SidebarItem, SidebarSection, SidebarToggle } from '../desktop/Sidebar'
import { SplitPane } from '../desktop/SplitPane'

/* -------------------------------- glyph set --------------------------------
 *
 * Ionicons, outline throughout. Window furniture — sidebar rows, tree rows —
 * and menu and palette rows all sit beside a label, and a filled glyph sits a
 * full step heavier than the text next to it. No sizes anywhere: each
 * component's own stylesheet sizes the glyph it is handed.
 *
 * The exception is ⌘, which Ionicons does not carry. It stays hand-drawn on
 * the 24 grid rather than being swapped for an icon that means something else.
 * -------------------------------------------------------------------------- */

const glyph = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RAIL = {
  inbox: <IoFileTrayOutline aria-hidden />,
  star: <IoStarOutline aria-hidden />,
  sent: <IoPaperPlaneOutline aria-hidden />,
  draft: <IoDocumentOutline aria-hidden />,
  archive: <IoArchiveOutline aria-hidden />,
  folder: <IoFolderOutline aria-hidden />,
  code: <IoCodeOutline aria-hidden />,
  gear: <IoSettingsOutline aria-hidden />,
}

const ICON = {
  compose: <IoCreateOutline aria-hidden />,
  window: <IoBrowsersOutline aria-hidden />,
  inbox: <IoFileTrayOutline aria-hidden />,
  drafts: <IoDocumentTextOutline aria-hidden />,
  gear: <IoSettingsOutline aria-hidden />,
  moon: <IoMoonOutline aria-hidden />,
  archive: <IoArchiveOutline aria-hidden />,
  trash: <IoTrashOutline aria-hidden />,
  command: glyph('M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z'),
  design: <IoBrushOutline aria-hidden />,
  info: <IoInformationCircleOutline aria-hidden />,
  eye: <IoEyeOutline aria-hidden />,
  rename: <IoPencilOutline aria-hidden />,
}

/* ------------------------------- sidebar data ------------------------------ */

interface Mailbox {
  id: string
  label: string
  icon: ReactNode
  badge?: number
  summary: string
}

const MAILBOXES: Mailbox[] = [
  { id: 'inbox', label: 'Inbox', icon: RAIL.inbox, badge: 12, summary: '12 unread — Grace Hopper, TestFlight and 10 others.' },
  { id: 'vip', label: 'VIPs', icon: RAIL.star, badge: 2, summary: 'Katherine Johnson and Radia Perlman are marked VIP.' },
  { id: 'sent', label: 'Sent', icon: RAIL.sent, summary: 'Everything sent from this Mac since 12 August.' },
  { id: 'drafts', label: 'Drafts', icon: RAIL.draft, badge: 3, summary: 'Three drafts, the oldest untouched since Monday.' },
]

const LOCAL: Mailbox[] = [
  { id: 'receipts', label: 'Receipts', icon: RAIL.folder, summary: '184 receipts filed on this Mac.' },
  { id: 'design-review', label: 'Design Review', icon: RAIL.folder, badge: 4, summary: 'Threads waiting on a design decision.' },
  { id: 'archive', label: 'Archive 2025', icon: RAIL.archive, summary: 'Last year, boxed up. 8.4 GB on disk.' },
]

const ALL_MAILBOXES = [...MAILBOXES, ...LOCAL]

/* ------------------------------- navtree data ------------------------------ */

const TREE: NavTreeNode[] = [
  {
    id: 'mayui',
    label: 'May UI',
    icon: RAIL.folder,
    children: [
      { id: 'components', label: 'Components', icon: RAIL.folder, badge: 54 },
      { id: 'desktop', label: 'Desktop', icon: RAIL.folder, badge: 6 },
      { id: 'mobile', label: 'Mobile', icon: RAIL.folder, badge: 9 },
      { id: 'tokens', label: 'tokens.css', icon: RAIL.code },
    ],
  },
  {
    id: 'mercury',
    label: 'Mercury',
    icon: RAIL.folder,
    children: [
      { id: 'mercury-ios', label: 'iOS App', icon: RAIL.code },
      { id: 'mercury-watch', label: 'Watch App', icon: RAIL.code },
      // Not checked out on this machine. Xcode greys the group out rather than
      // hiding it, so the navigator keeps the same shape between clones.
      { id: 'mercury-vision', label: 'Vision App', icon: RAIL.code, disabled: true },
    ],
  },
  { id: 'archive-2025', label: 'Archive 2025', icon: RAIL.archive },
]

const TREE_LABELS: Record<string, string> = {
  mayui: 'May UI',
  components: 'Components',
  desktop: 'Desktop',
  mobile: 'Mobile',
  tokens: 'tokens.css',
  mercury: 'Mercury',
  'mercury-ios': 'iOS App',
  'mercury-watch': 'Watch App',
  'archive-2025': 'Archive 2025',
}

/* ------------------------------ splitpane data ----------------------------- */

interface Draft {
  id: string
  title: string
  meta: string
  body: string
}

const DRAFTS: Draft[] = [
  {
    id: 'd-timings',
    title: 'Re: Compiler notes for Thursday',
    meta: 'To Grace Hopper — 9:41 AM',
    body: 'The linker is still the long pole at 41 seconds cold, and nine of those go on re-reading symbols we already have on disk.',
  },
  {
    id: 'd-handoff',
    title: 'Handoff walkthrough — 2 files',
    meta: 'To Katherine Johnson — 8:12 AM',
    body: 'Attached the QuickTime and the palette audit. The arrows are a shade lighter in dark mode now, as asked.',
  },
  {
    id: 'd-room',
    title: 'Room 4 for Wednesday afternoon',
    meta: 'To Studio Booking — Yesterday',
    body: 'Two hours from 14:00 would suit us. The display in there is a Studio Display, not a Pro XDR.',
  },
]

/* ------------------------------ datatable data ----------------------------- */

interface Build {
  id: string
  app: string
  version: string
  platform: string
  size: number
  status: string
  pushed: string
}

const BUILDS: Build[] = [
  { id: 'b-118', app: 'Mercury', version: '4.2 (118)', platform: 'iOS', size: 42.6, status: 'Testing', pushed: 'Today at 9:41 AM' },
  { id: 'b-117', app: 'Mercury', version: '4.2 (117)', platform: 'iOS', size: 42.1, status: 'Expired', pushed: 'Yesterday at 4:08 PM' },
  { id: 'b-84', app: 'Mercury for Mac', version: '2.0 (84)', platform: 'macOS', size: 118.4, status: 'Testing', pushed: 'Yesterday at 11:26 AM' },
  { id: 'b-31', app: 'Mercury for Watch', version: '1.4 (31)', platform: 'watchOS', size: 12.8, status: 'In Review', pushed: '8 Sep 2026' },
  { id: 'b-52', app: 'Mercury for Vision', version: '1.0 (52)', platform: 'visionOS', size: 210.4, status: 'Processing', pushed: '7 Sep 2026' },
  { id: 'b-206', app: 'May UI Gallery', version: '0.9 (206)', platform: 'iPadOS', size: 88.7, status: 'Internal', pushed: '6 Sep 2026' },
  { id: 'b-205', app: 'May UI Gallery', version: '0.9 (205)', platform: 'iPadOS', size: 88.2, status: 'Expired', pushed: '4 Sep 2026' },
  { id: 'b-9', app: 'Mercury for TV', version: '1.0 (9)', platform: 'tvOS', size: 64.2, status: 'Internal', pushed: '1 Sep 2026' },
]

const BUILD_COLUMNS: DataTableColumn<Build>[] = [
  { key: 'app', header: 'App', width: 190, filter: 'text' },
  { key: 'version', header: 'Version', width: 130 },
  { key: 'platform', header: 'Platform', width: 130, filter: 'select' },
  {
    key: 'size',
    header: 'Size',
    numeric: true,
    width: 110,
    value: (row) => row.size,
    render: (row) => `${row.size.toFixed(1)} MB`,
  },
  { key: 'status', header: 'Status', width: 130, filter: 'select' },
  { key: 'pushed', header: 'Pushed', width: 180 },
]

/* --------------------------- command palette data -------------------------- */

const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: 'actions',
    heading: 'Actions',
    items: [
      { id: 'new-message', label: 'New Message', icon: ICON.compose, shortcut: ['cmd', 'n'] },
      { id: 'new-window', label: 'New Window', icon: ICON.window, shortcut: ['cmd', 'shift', 'n'] },
      { id: 'archive', label: 'Archive Conversation', icon: ICON.archive, shortcut: ['cmd', 'ctrl', 'a'], keywords: ['file', 'store'] },
    ],
  },
  {
    id: 'go',
    heading: 'Go To',
    items: [
      { id: 'go-inbox', label: 'Inbox', icon: ICON.inbox, hint: '12 unread', shortcut: ['cmd', '1'] },
      { id: 'go-drafts', label: 'Drafts', icon: ICON.drafts, hint: '3 drafts', shortcut: ['cmd', '2'] },
      { id: 'go-settings', label: 'Settings', icon: ICON.gear, shortcut: ['cmd', ','] },
    ],
  },
  {
    id: 'view',
    heading: 'View',
    items: [
      { id: 'appearance', label: 'Toggle Dark Appearance', icon: ICON.moon, keywords: ['theme', 'light', 'night'] },
      { id: 'trash', label: 'Move to Trash', icon: ICON.trash, shortcut: ['cmd', 'backspace'], destructive: true },
    ],
  },
]

/* ---------------------------------- frame ---------------------------------- */

interface EntryProps {
  /** The exported name, set below the frame in the monospace face. */
  name: string
  /** Every desktop component assumes a box with a definite height. */
  height: string
  /** Full-bleed across the grid, for the two components that need the width. */
  span?: boolean
  /** Inset the frame, for anything that is not itself edge-to-edge chrome. */
  padded?: boolean
  children: ReactNode
}

/**
 * One catalogue entry: a bounded frame, then the component's name under it.
 *
 * The frame is deliberately *not* transformed. Sidebar's rail flyout,
 * CommandPalette's scrim and ContextMenu's panel are all positioned against
 * the real viewport, and a transform on an ancestor makes it the containing
 * block for fixed descendants — which is exactly how you end up with a menu
 * hanging off the wrong corner of the page.
 */
function Entry({ name, height, span = false, padded = false, children }: EntryProps) {
  return (
    <section style={{ gridColumn: span ? '1 / -1' : 'auto', minWidth: 0 }}>
      <div
        style={{
          height,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
          padding: padded ? 'var(--may-space-4)' : 'var(--may-space-0)',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
          boxShadow: 'var(--may-shadow-sm)',
        }}
      >
        {children}
      </div>
      <Text variant="caption-1" tone="secondary" mono style={{ paddingTop: 'var(--may-space-2)' }}>
        {name}
      </Text>
    </section>
  )
}

/* ---------------------------------- screen --------------------------------- */

/**
 * Every component in the desktop family, once each, in a representative
 * default state — the view that makes a family judgeable at a glance.
 */
export function CatalogDesktop() {
  const [mailbox, setMailbox] = useState('inbox')
  const [node, setNode] = useState('desktop')
  const [draft, setDraft] = useState('d-timings')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [ranCommand, setRanCommand] = useState<string | null>(null)
  const [menuAction, setMenuAction] = useState<string | null>(null)

  const activeMailbox = ALL_MAILBOXES.find((item) => item.id === mailbox) ?? MAILBOXES[0]!
  const activeDraft = DRAFTS.find((item) => item.id === draft) ?? DRAFTS[0]!

  const fileMenu: ContextMenuEntry[] = [
    { type: 'label', label: 'Nav Redesign.sketch' },
    { id: 'open', label: 'Open', icon: ICON.design, shortcut: ['cmd', 'o'], onSelect: () => setMenuAction('Open') },
    {
      id: 'open-with',
      label: 'Open With',
      icon: ICON.window,
      items: [
        { id: 'ow-sketch', label: 'Sketch', onSelect: () => setMenuAction('Open with Sketch') },
        { id: 'ow-preview', label: 'Preview', onSelect: () => setMenuAction('Open with Preview') },
        { id: 'ow-xcode', label: 'Xcode', disabled: true },
      ],
    },
    { id: 'quick-look', label: 'Quick Look', icon: ICON.eye, shortcut: ['space'], onSelect: () => setMenuAction('Quick Look') },
    { type: 'separator' },
    { id: 'info', label: 'Get Info', icon: ICON.info, shortcut: ['cmd', 'i'], onSelect: () => setMenuAction('Get Info') },
    { id: 'rename', label: 'Rename', icon: ICON.rename, onSelect: () => setMenuAction('Rename') },
    { type: 'separator' },
    {
      id: 'trash',
      label: 'Move to Trash',
      icon: ICON.trash,
      shortcut: ['cmd', 'backspace'],
      destructive: true,
      onSelect: () => setMenuAction('Moved to Trash'),
    },
  ]

  return (
    <div
      style={{
        height: '100%',
        minHeight: '32rem',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--may-space-1)',
          padding: 'var(--may-space-6) var(--may-space-6) var(--may-space-4)',
          background: 'var(--may-color-surface)',
        }}
      >
        <Heading level={1} size="title-2">
          Desktop Family
        </Heading>
        <Text variant="footnote" tone="secondary">
          All six desktop components, once each, in a bounded frame. Nine exported names — Sidebar
          brings its section, item and toggle with it.
        </Text>
      </div>
      <Separator />

      <div
        data-slot="scroll-area"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--may-space-6)' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))',
            gap: 'var(--may-space-6)',
            alignItems: 'start',
          }}
        >
          {/* ------------------------------- Sidebar ------------------------------ */}
          <Entry name="Sidebar · SidebarSection · SidebarItem · SidebarToggle" height="24rem">
            <Sidebar
              aria-label="Mailboxes"
              header={<SidebarToggle />}
              footer={
                <SidebarItem icon={RAIL.gear} onClick={() => setMailbox('inbox')}>
                  Settings
                </SidebarItem>
              }
            >
              <SidebarSection title="Favourites">
                {MAILBOXES.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    badge={item.badge}
                    active={item.id === mailbox}
                    onClick={() => setMailbox(item.id)}
                  >
                    {item.label}
                  </SidebarItem>
                ))}
              </SidebarSection>
              <SidebarSection title="On My Mac" collapsible>
                {LOCAL.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    badge={item.badge}
                    active={item.id === mailbox}
                    onClick={() => setMailbox(item.id)}
                  >
                    {item.label}
                  </SidebarItem>
                ))}
              </SidebarSection>
            </Sidebar>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--may-space-2)',
                justifyContent: 'center',
                padding: 'var(--may-space-5)',
                background: 'var(--may-color-surface)',
              }}
            >
              <Heading level={2} size="headline">
                {activeMailbox.label}
              </Heading>
              <Text variant="footnote" tone="secondary">
                {activeMailbox.summary}
              </Text>
              <Text variant="caption-2" tone="tertiary">
                Collapse the sidebar from its header to see the rail, and hover a row for the
                flyout label.
              </Text>
            </div>
          </Entry>

          {/* ------------------------------- NavTree ------------------------------ */}
          <Entry name="NavTree" height="24rem" padded>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--may-space-3)',
              }}
            >
              <div data-slot="scroll-area" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <NavTree
                  aria-label="Project navigator"
                  nodes={TREE}
                  selectedId={node}
                  defaultExpandedIds={['mayui', 'mercury']}
                  onSelect={(id) => setNode(id)}
                />
              </div>
              <Text variant="footnote" tone="secondary">
                Selected: {TREE_LABELS[node] ?? 'Nothing'}. Arrow keys move inside the tree — the
                whole thing is one tab stop.
              </Text>
            </div>
          </Entry>

          {/* ------------------------------ SplitPane ----------------------------- */}
          <Entry name="SplitPane" height="20rem" span>
            <SplitPane defaultSize={280} min={220} max={420} dividerLabel="Resize draft list">
              <div data-slot="scroll-area" style={{ height: '100%', overflowY: 'auto' }}>
                <List variant="plain">
                  {DRAFTS.map((item) => (
                    <ListRow
                      key={item.id}
                      title={item.title}
                      subtitle={item.meta}
                      // A chevron promises a push. This list swaps the pane
                      // beside it, which is not the same gesture.
                      chevron={false}
                      onClick={() => setDraft(item.id)}
                    />
                  ))}
                </List>
              </div>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--may-space-2)',
                  padding: 'var(--may-space-5)',
                  background: 'var(--may-color-surface)',
                }}
              >
                <Heading level={2} size="headline">
                  {activeDraft.title}
                </Heading>
                <Text variant="footnote" tone="tertiary">
                  {activeDraft.meta}
                </Text>
                <Text variant="body">{activeDraft.body}</Text>
              </div>
            </SplitPane>
          </Entry>

          {/* ------------------------------ DataTable ----------------------------- */}
          <Entry name="DataTable" height="26rem" span padded>
            <DataTable
              columns={BUILD_COLUMNS}
              data={BUILDS}
              rowKey="id"
              size="sm"
              selectable
              defaultSelectedKeys={['b-118']}
              defaultSort={[{ key: 'pushed', direction: 'desc' }]}
              resizableColumns
              zebra
              stickyHeader
              // stickyHeader needs a bound to pin against — the scrollport has
              // to be the table's own box, not the page.
              maxHeight="100%"
              style={{ flex: 1, minWidth: 0 }}
            />
          </Entry>

          {/* ---------------------------- CommandPalette -------------------------- */}
          <Entry name="CommandPalette" height="14rem" padded>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--may-space-3)',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Button
                variant="tinted"
                leadingIcon={ICON.command}
                onClick={() => setPaletteOpen(true)}
              >
                Commands…
              </Button>
              <Text variant="footnote" tone="secondary">
                {ranCommand
                  ? `Last command: ${ranCommand}`
                  : 'Press ⌘K, or the button, to open the palette.'}
              </Text>
            </div>
          </Entry>

          {/* ------------------------------ ContextMenu --------------------------- */}
          <Entry name="ContextMenu" height="14rem" padded>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--may-space-3)',
              }}
            >
              <ContextMenu items={fileMenu} label="File actions">
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--may-space-1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--may-space-4)',
                    borderRadius: 'var(--may-radius-lg)',
                    background: 'var(--may-color-surface-nested)',
                  }}
                >
                  <Text variant="subheadline" weight="semibold">
                    Nav Redesign.sketch
                  </Text>
                  <Text variant="caption-1" tone="tertiary">
                    Sketch Document — 24.8 MB
                  </Text>
                </div>
              </ContextMenu>
              <Text variant="footnote" tone="secondary">
                {menuAction
                  ? `Last command: ${menuAction}`
                  : 'Right-click, or Control-click, the file to open its menu.'}
              </Text>
            </div>
          </Entry>
        </div>
      </div>

      {/*
       * Overlays render inline against a fixed scrim rather than through a
       * portal, so the palette is happy to live at the end of the tree.
       */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        groups={COMMAND_GROUPS}
        placeholder="Search commands"
        label="Desktop commands"
        onSelect={(item) => setRanCommand(item.label)}
      />
    </div>
  )
}
