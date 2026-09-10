import type { MouseEvent, ReactNode } from 'react'
import { useState } from 'react'

import { Breadcrumb } from '../components/Breadcrumb'
import type { BreadcrumbItem } from '../components/Breadcrumb'
import { EmptyState } from '../components/EmptyState'
import { IconTile } from '../components/IconTile'
import type { IconTileGradient } from '../components/IconTile'
import { SearchField } from '../components/SearchField'
import { SegmentedControl } from '../components/SegmentedControl'
import { Stack } from '../components/Stack'
import { Table } from '../components/Table'
import type { TableColumn } from '../components/Table'
import { Text } from '../components/Text'
import { Toolbar } from '../components/Toolbar'
import { ContextMenu } from '../desktop/ContextMenu'
import type { ContextMenuEntry } from '../desktop/ContextMenu'
import { NavTree } from '../desktop/NavTree'
import type { NavTreeNode } from '../desktop/NavTree'
import { SplitPane } from '../desktop/SplitPane'

/* -------------------------------- glyph set -------------------------------- */

/** Sidebar glyphs sit on the 16px grid the rest of the chrome uses. */
const chrome = (d: string): ReactNode => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** File-kind glyphs ride inside an IconTile, so they are drawn at 24. */
const kindGlyph = (d: string): ReactNode => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CHROME = {
  cloud: chrome('M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.7.6 2.7 2.7 0 0 1-.4 5.4z'),
  folder: chrome('M1.5 4.5A1 1 0 0 1 2.5 3.5h3l1.5 1.5h5.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z'),
  drive: chrome('M2 3.5h12v9H2zM4.5 10h.01M4.5 6h7'),
  globe: chrome('M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM2.4 6.5h11.2M2.4 9.5h11.2M8 2c-3 3.4-3 8.6 0 12 3-3.4 3-8.6 0-12z'),
  tag: chrome('M2.5 2.5h5l6 6-5 5-6-6zM5 5h.01'),
}

const KIND = {
  folder: kindGlyph('M3 6.5A1.5 1.5 0 0 1 4.5 5h4L11 7.5h8.5A1.5 1.5 0 0 1 21 9v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z'),
  doc: kindGlyph('M6 3h7l5 5v13H6zM13 3v5h5'),
  design: kindGlyph('M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z'),
  image: kindGlyph('M4 5h16v14H4zM6 17l4.5-5 3 3.5 2.5-2.5 4 4M15.5 9h.01'),
  code: kindGlyph('M6 3h12v18H6zM10.5 11 9 13l1.5 2m3-4L15 13l-1.5 2'),
  sheet: kindGlyph('M5 19V9m5 10V5m5 14v-7m5 7V8'),
  deck: kindGlyph('M4 5h16v9H4zM12 14v5m-3 0h6'),
  movie: kindGlyph('M3 6h18v12H3zM10 9.5l5 2.5-5 2.5z'),
  archive: kindGlyph('M5 3h14v18H5zM12 3v2m0 2v2m0 2v2m0 2v3'),
}

/** Menu glyphs are their own set: a command is an action, not a file kind. */
const MENU = {
  open: kindGlyph('M9 5H5v14h14v-4M14 4h6v6M20 4l-8 8'),
  apps: kindGlyph('M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'),
  info: kindGlyph('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11.5v5M12 8h.01'),
  pencil: kindGlyph('M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z'),
  trash: kindGlyph('M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13'),
}

/* ---------------------------------- data ----------------------------------- */

interface FileRow {
  id: string
  name: string
  kind: string
  /** Pre-formatted the way Finder prints it, never a raw byte count. */
  size: string
  modified: string
  tint: IconTileGradient
  glyph: ReactNode
}

const ICLOUD: FileRow[] = [
  { id: 'f-documents', name: 'Documents', kind: 'Folder', size: '214.6 MB', modified: 'Today at 9:12 AM', tint: 'blue', glyph: KIND.folder },
  { id: 'f-projects', name: 'Projects', kind: 'Folder', size: '2.14 GB', modified: 'Today at 7:55 AM', tint: 'blue', glyph: KIND.folder },
  { id: 'f-design', name: 'Design', kind: 'Folder', size: '628.9 MB', modified: 'Today at 9:41 AM', tint: 'blue', glyph: KIND.folder },
  { id: 'f-desktop', name: 'Desktop', kind: 'Folder', size: '44.2 MB', modified: 'Yesterday at 6:03 PM', tint: 'blue', glyph: KIND.folder },
]

const DESIGN: FileRow[] = [
  { id: 'd-nav', name: 'Nav Redesign.sketch', kind: 'Sketch Document', size: '24.8 MB', modified: 'Today at 9:41 AM', tint: 'purple', glyph: KIND.design },
  { id: 'd-grid', name: 'Icon Grid.svg', kind: 'SVG Image', size: '412 KB', modified: 'Today at 8:27 AM', tint: 'teal', glyph: KIND.image },
  { id: 'd-audit', name: 'Palette Audit.pdf', kind: 'PDF Document', size: '3.2 MB', modified: 'Yesterday at 5:12 PM', tint: 'red', glyph: KIND.doc },
  { id: 'd-tokens', name: 'May UI Tokens.json', kind: 'JSON Document', size: '48 KB', modified: 'Yesterday at 11:04 AM', tint: 'gray', glyph: KIND.code },
  { id: 'd-onboarding', name: 'Onboarding Flow.key', kind: 'Keynote Presentation', size: '112.4 MB', modified: '4 Sep 2026', tint: 'orange', glyph: KIND.deck },
  { id: 'd-walkthrough', name: 'Handoff Walkthrough.mov', kind: 'QuickTime Movie', size: '486.1 MB', modified: '2 Sep 2026', tint: 'indigo', glyph: KIND.movie },
  { id: 'd-scale', name: 'Type Scale.numbers', kind: 'Numbers Spreadsheet', size: '268 KB', modified: '28 Aug 2026', tint: 'green', glyph: KIND.sheet },
  { id: 'd-archive', name: 'Archive 2025.zip', kind: 'ZIP Archive', size: '1.24 GB', modified: '12 Aug 2026', tint: 'gray', glyph: KIND.archive },
]

const PROJECTS: FileRow[] = [
  { id: 'p-mercury', name: 'Mercury', kind: 'Folder', size: '1.42 GB', modified: 'Today at 7:55 AM', tint: 'blue', glyph: KIND.folder },
  { id: 'p-mayui', name: 'May UI', kind: 'Folder', size: '684.2 MB', modified: 'Yesterday at 9:18 PM', tint: 'blue', glyph: KIND.folder },
  { id: 'p-roadmap', name: 'Roadmap Q4.numbers', kind: 'Numbers Spreadsheet', size: '812 KB', modified: '5 Sep 2026', tint: 'green', glyph: KIND.sheet },
  { id: 'p-notes', name: 'Release Notes.md', kind: 'Markdown Document', size: '12 KB', modified: '5 Sep 2026', tint: 'gray', glyph: KIND.code },
]

const DOCUMENTS: FileRow[] = [
  { id: 'o-receipts', name: 'Scanned Receipts', kind: 'Folder', size: '96.4 MB', modified: '1 Sep 2026', tint: 'blue', glyph: KIND.folder },
  { id: 'o-invoice', name: 'Invoice 2026-08.pdf', kind: 'PDF Document', size: '184 KB', modified: '31 Aug 2026', tint: 'red', glyph: KIND.doc },
  { id: 'o-lease', name: 'Lease Agreement.pdf', kind: 'PDF Document', size: '1.8 MB', modified: '27 Aug 2026', tint: 'red', glyph: KIND.doc },
  { id: 'o-recipes', name: 'Family Recipes.rtf', kind: 'Rich Text Document', size: '62 KB', modified: '19 Jul 2026', tint: 'gray', glyph: KIND.doc },
]

const MACINTOSH_HD: FileRow[] = [
  { id: 'm-applications', name: 'Applications', kind: 'Folder', size: '38.4 GB', modified: '6 Sep 2026', tint: 'gray', glyph: KIND.folder },
  { id: 'm-library', name: 'Library', kind: 'Folder', size: '14.9 GB', modified: '6 Sep 2026', tint: 'gray', glyph: KIND.folder },
  { id: 'm-system', name: 'System', kind: 'Folder', size: '11.2 GB', modified: '22 Aug 2026', tint: 'gray', glyph: KIND.folder },
  { id: 'm-users', name: 'Users', kind: 'Folder', size: '312.7 GB', modified: 'Today at 9:41 AM', tint: 'gray', glyph: KIND.folder },
]

/** A tag is a saved search across folders, so its rows are the same records. */
const byName = (...names: string[]): FileRow[] =>
  [...DESIGN, ...PROJECTS, ...DOCUMENTS].filter((file) => names.includes(file.name))

const FOLDERS: Record<string, FileRow[]> = {
  icloud: ICLOUD,
  documents: DOCUMENTS,
  projects: PROJECTS,
  design: DESIGN,
  'macintosh-hd': MACINTOSH_HD,
  'time-machine': [],
  network: [],
  locations: [],
  tags: [],
  'tag-review': byName('Nav Redesign.sketch', 'Palette Audit.pdf', 'Onboarding Flow.key'),
  'tag-client': byName('Roadmap Q4.numbers', 'Invoice 2026-08.pdf'),
  'tag-archive': byName('Archive 2025.zip', 'Family Recipes.rtf'),
}

/** Finder's tag dots are the one place in the sidebar where colour carries meaning. */
function TagDot({ colour }: { colour: string }) {
  return (
    <span
      style={{
        display: 'block',
        width: 'var(--may-space-3)',
        height: 'var(--may-space-3)',
        borderRadius: 'var(--may-radius-full)',
        background: colour,
      }}
    />
  )
}

const TREE: NavTreeNode[] = [
  {
    id: 'icloud',
    label: 'iCloud Drive',
    icon: CHROME.cloud,
    children: [
      { id: 'documents', label: 'Documents', icon: CHROME.folder },
      { id: 'projects', label: 'Projects', icon: CHROME.folder, badge: 2 },
      { id: 'design', label: 'Design', icon: CHROME.folder, badge: 8 },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: CHROME.drive,
    children: [
      { id: 'macintosh-hd', label: 'Macintosh HD', icon: CHROME.drive },
      // The backup disk is not plugged in. Finder greys it out rather than
      // hiding it, so the sidebar keeps the same shape between trips.
      { id: 'time-machine', label: 'Time Machine', icon: CHROME.drive, disabled: true },
      { id: 'network', label: 'Network', icon: CHROME.globe },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: CHROME.tag,
    children: [
      { id: 'tag-review', label: 'Design Review', icon: <TagDot colour="var(--may-red)" />, badge: 3 },
      { id: 'tag-client', label: 'Client Work', icon: <TagDot colour="var(--may-blue)" /> },
      { id: 'tag-archive', label: 'Archive', icon: <TagDot colour="var(--may-gray)" /> },
    ],
  },
]

/**
 * Walk the tree for the chain of folders leading to `id`. The breadcrumb is
 * derived from the same nodes the sidebar renders rather than kept alongside
 * them — two hand-maintained copies of a hierarchy drift the first time a
 * folder moves.
 */
function pathTo(nodes: NavTreeNode[], id: string, trail: NavTreeNode[] = []): NavTreeNode[] | null {
  for (const node of nodes) {
    const next = [...trail, node]
    if (node.id === id) return next
    const found = node.children ? pathTo(node.children, id, next) : null
    if (found) return found
  }
  return null
}

const VIEWS = [
  { label: 'Icons', value: 'icons' },
  { label: 'List', value: 'list' },
  { label: 'Columns', value: 'columns' },
  { label: 'Gallery', value: 'gallery' },
]

/**
 * Finder.
 *
 * A `SplitPane` carrying the source list on the left and the browser on the
 * right, which is the layout every document app on the platform inherits. The
 * divider is draggable and the left pane is collapsible, so the same screen
 * covers both the sidebar-open and sidebar-shut states of a real window.
 *
 * The file table is wrapped in a single `ContextMenu` rather than one menu per
 * row: `ContextMenu` is `display: contents`, and wrapping every row separately
 * would break the sibling selectors a table's own rows rely on. The row under
 * the pointer is read off the event instead, which is what Finder itself does —
 * right-clicking a row selects it before the menu opens.
 */
export function FileBrowserScreen() {
  const [folder, setFolder] = useState('design')
  const [selected, setSelected] = useState('d-nav')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  /** The last menu command, echoed in the status bar. Null until one is run. */
  const [action, setAction] = useState<string | null>(null)

  const contents = FOLDERS[folder] ?? []
  const rows = query
    ? contents.filter((file) => file.name.toLowerCase().includes(query.trim().toLowerCase()))
    : contents

  const trail = pathTo(TREE, folder) ?? []
  const crumbs: BreadcrumbItem[] = trail.map((node) => ({
    label: node.label,
    icon: node.icon,
    onClick: () => {
      setFolder(node.id)
      setAction(null)
    },
  }))

  const target = contents.find((file) => file.id === selected) ?? rows[0]

  /* --------------------------------- actions -------------------------------- */

  const run = (label: string) => {
    setAction(target ? `${label} — “${target.name}”` : label)
  }

  const menu: ContextMenuEntry[] = [
    { id: 'open', label: 'Open', icon: MENU.open, shortcut: ['cmd', 'o'], onSelect: () => run('Open') },
    {
      id: 'open-with',
      label: 'Open With',
      icon: MENU.apps,
      items: [
        { id: 'ow-preview', label: 'Preview', onSelect: () => run('Open with Preview') },
        { id: 'ow-sketch', label: 'Sketch', onSelect: () => run('Open with Sketch') },
        { id: 'ow-figma', label: 'Figma', onSelect: () => run('Open with Figma') },
        { id: 'ow-xcode', label: 'Xcode', disabled: true },
        { type: 'separator' },
        { id: 'ow-other', label: 'Other…', shortcut: ['cmd', 'shift', 'o'], onSelect: () => run('Choose application') },
      ],
    },
    { type: 'separator' },
    { id: 'info', label: 'Get Info', icon: MENU.info, shortcut: ['cmd', 'i'], onSelect: () => run('Get Info') },
    { id: 'rename', label: 'Rename', icon: MENU.pencil, shortcut: ['enter'], onSelect: () => run('Rename') },
    { type: 'separator' },
    {
      id: 'trash',
      label: 'Move to Trash',
      icon: MENU.trash,
      shortcut: ['cmd', 'backspace'],
      destructive: true,
      onSelect: () => run('Moved to Trash'),
    },
  ]

  /**
   * The menu hangs off the whole table, so the row has to come from the event.
   * `sectionRowIndex` counts within `<tbody>`, which is exactly the index into
   * the rows currently on screen — the filtered list, not the folder.
   */
  const selectUnderPointer = (event: MouseEvent<HTMLDivElement>) => {
    const row = (event.target as HTMLElement).closest('tbody tr')
    if (!(row instanceof HTMLTableRowElement)) return
    const file = rows[row.sectionRowIndex]
    if (file) setSelected(file.id)
  }

  /* --------------------------------- columns -------------------------------- */

  const columns: TableColumn<FileRow>[] = [
    {
      key: 'name',
      header: 'Name',
      // The one column that survives the collapse to a phone: below 1024px the
      // table reshapes into grouped List rows and this becomes each row's title.
      primary: true,
      render: (file) => (
        <Stack direction="row" gap={3} align="center">
          <IconTile gradient={file.tint} size="sm">
            {file.glyph}
          </IconTile>
          <span>{file.name}</span>
        </Stack>
      ),
    },
    { key: 'kind', header: 'Kind', width: '11rem' },
    { key: 'size', header: 'Size', numeric: true, width: '7rem' },
    { key: 'modified', header: 'Date Modified', width: '13rem' },
  ]

  const status =
    action ??
    (query
      ? `${rows.length} of ${contents.length} items`
      : `${contents.length} items, 402.6 GB available`)

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
      <SplitPane
        collapsible
        defaultSize={244}
        min={200}
        max={360}
        dividerLabel="Resize sidebar"
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* Source list. Its own pane scrolls, so the tree can grow past the window. */}
        <div style={{ padding: 'var(--may-space-3)', height: '100%' }}>
          <NavTree
            aria-label="Sidebar"
            nodes={TREE}
            defaultExpandedIds={['icloud', 'locations', 'tags']}
            selectedId={folder}
            onSelect={(id) => {
              setFolder(id)
              setQuery('')
              setAction(null)
            }}
          />
        </div>

        {/* Browser: toolbar, file table, status bar — three rows, middle one scrolls. */}
        <div
          style={{
            height: '100%',
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr) auto',
          }}
        >
          <Toolbar placement="top" separator align="between" variant="surface">
            <Breadcrumb items={crumbs} size="sm" aria-label="Location" />
            <Stack direction="row" gap={3} align="center">
              <SegmentedControl
                aria-label="View"
                size="sm"
                options={VIEWS}
                value={view}
                onValueChange={setView}
              />
              <SearchField
                size="sm"
                placeholder="Search"
                value={query}
                onValueChange={setQuery}
                aria-label="Search this folder"
                style={{ width: '13rem' }}
              />
            </Stack>
          </Toolbar>

          <div style={{ minHeight: 0, display: 'flex', padding: 'var(--may-space-4)' }}>
            <ContextMenu items={menu} label="File actions">
              <div
                onContextMenu={selectUnderPointer}
                style={{ flex: 1, minWidth: 0, display: 'flex' }}
              >
                <Table
                  columns={columns}
                  data={rows}
                  rowKey="id"
                  // Icon and Gallery views trade rows for room; List and Columns
                  // stay on the compact rung, the way Finder's own views do.
                  size={view === 'icons' || view === 'gallery' ? 'md' : 'sm'}
                  zebra
                  stickyHeader
                  // stickyHeader does nothing without a bound: the scrollport
                  // has to be the table's own box, not the page.
                  maxHeight="100%"
                  selectedKeys={selected ? [selected] : []}
                  onRowClick={(file) => {
                    setSelected(file.id)
                    setAction(null)
                  }}
                  emptyState={
                    <EmptyState
                      title={query ? 'No Results' : 'Folder Is Empty'}
                      description={
                        query
                          ? `Nothing in this folder matches “${query.trim()}”.`
                          : 'Drag files here, or use File ▸ New Folder to start one.'
                      }
                    />
                  }
                  style={{ height: '100%' }}
                />
              </div>
            </ContextMenu>
          </div>

          <Toolbar placement="bottom" separator align="center" variant="surface">
            <Text variant="footnote" tone="secondary">
              {status}
            </Text>
          </Toolbar>
        </div>
      </SplitPane>
    </div>
  )
}
