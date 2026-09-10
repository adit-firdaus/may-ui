import type { MouseEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  IoAppsOutline,
  IoArchive,
  IoBrush,
  IoCloudOutline,
  IoCodeSlash,
  IoDocument,
  IoEasel,
  IoFolder,
  IoFolderOutline,
  IoGlobeOutline,
  IoImage,
  IoInformationCircleOutline,
  IoOpenOutline,
  IoPencilOutline,
  IoPricetagOutline,
  IoServerOutline,
  IoStatsChart,
  IoTrashOutline,
  IoVideocam,
} from 'react-icons/io5'

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

const CHROME = {
  cloud: <IoCloudOutline aria-hidden />,
  folder: <IoFolderOutline aria-hidden />,
  drive: <IoServerOutline aria-hidden />,
  globe: <IoGlobeOutline aria-hidden />,
  tag: <IoPricetagOutline aria-hidden />,
}

const KIND = {
  folder: <IoFolder aria-hidden />,
  doc: <IoDocument aria-hidden />,
  design: <IoBrush aria-hidden />,
  image: <IoImage aria-hidden />,
  code: <IoCodeSlash aria-hidden />,
  sheet: <IoStatsChart aria-hidden />,
  deck: <IoEasel aria-hidden />,
  movie: <IoVideocam aria-hidden />,
  archive: <IoArchive aria-hidden />,
}

/** Menu glyphs are their own set: a command is an action, not a file kind. */
const MENU = {
  open: <IoOpenOutline aria-hidden />,
  apps: <IoAppsOutline aria-hidden />,
  info: <IoInformationCircleOutline aria-hidden />,
  pencil: <IoPencilOutline aria-hidden />,
  trash: <IoTrashOutline aria-hidden />,
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
