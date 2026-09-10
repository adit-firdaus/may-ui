import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Table } from './Table'
import type { TableColumn, TableProps } from './Table'
import { EmptyState } from '../EmptyState/EmptyState'

interface Device {
  id: string
  name: string
  model: string
  os: string
  battery: number
  lastSeen: string
}

const devices: Device[] = [
  { id: 'd1', name: "Ada's iPhone", model: 'iPhone 15 Pro', os: '18.2', battery: 84, lastSeen: '2 min ago' },
  { id: 'd2', name: 'Studio iPad', model: 'iPad Pro 11"', os: '18.1', battery: 42, lastSeen: '1 hr ago' },
  { id: 'd3', name: 'Ada’s MacBook Pro', model: 'MacBook Pro 14"', os: '15.2', battery: 100, lastSeen: 'Just now' },
  { id: 'd4', name: 'Living Room', model: 'Apple TV 4K', os: '18.1', battery: 0, lastSeen: 'Yesterday' },
  { id: 'd5', name: 'Ada’s Watch', model: 'Apple Watch Ultra 2', os: '11.2', battery: 61, lastSeen: '6 min ago' },
]

const deviceColumns: TableColumn<Device>[] = [
  { key: 'name', header: 'Device', primary: true },
  { key: 'model', header: 'Model' },
  { key: 'os', header: 'Version', width: 96 },
  {
    key: 'battery',
    header: 'Battery',
    numeric: true,
    width: 96,
    // Mains-powered devices report no battery at all — an em dash says that,
    // where "0%" would read as a device about to die.
    render: (device) => (device.battery > 0 ? `${device.battery}%` : '—'),
  },
  { key: 'lastSeen', header: 'Last Seen', width: 128 },
]

const meta = {
  title: 'Catalog/Adaptive/Table',
  component: Table,
  parameters: { layout: 'padded' },
  args: {
    columns: deviceColumns,
    data: devices,
    rowKey: 'id',
    caption: 'Devices',
  },
} satisfies Meta<TableProps<Device>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The desktop shape. Narrow the Storybook viewport past 1024px and the same
 * props collapse into grouped List rows: Device becomes the title, Last Seen
 * the trailing detail, and Model / Version / Battery the subtitle.
 */
export const Devices: Story = {}

interface StorageRow {
  id: string
  app: string
  kind: string
  items: number
  size: string
}

const storage: StorageRow[] = [
  { id: 's1', app: 'Photos', kind: 'Library', items: 24_318, size: '61.2 GB' },
  { id: 's2', app: 'Messages', kind: 'Attachments', items: 8_204, size: '12.4 GB' },
  { id: 's3', app: 'Voice Memos', kind: 'Recordings', items: 96, size: '2.1 GB' },
  { id: 's4', app: 'Notes', kind: 'Documents', items: 1_442, size: '640 MB' },
  { id: 's5', app: 'Keynote', kind: 'Documents', items: 37, size: '4.8 GB' },
]

const storageColumns: TableColumn<StorageRow>[] = [
  { key: 'app', header: 'App', primary: true },
  { key: 'kind', header: 'Kind' },
  { key: 'items', header: 'Items', numeric: true, render: (row) => row.items.toLocaleString('en-US') },
  { key: 'size', header: 'Size', numeric: true, width: 112 },
]

function SelectableStorage() {
  const [selected, setSelected] = useState<string[]>(['s2'])

  const toggle = (row: StorageRow) =>
    setSelected((keys) =>
      keys.includes(row.id) ? keys.filter((key) => key !== row.id) : [...keys, row.id],
    )

  return (
    <Table
      caption="iCloud Storage"
      columns={storageColumns}
      data={storage}
      rowKey="id"
      selectedKeys={selected}
      onRowClick={toggle}
    />
  )
}

/**
 * Clicking a row toggles it. Selection springs a tint bar in on the leading
 * edge of the desktop row, and becomes iOS's trailing checkmark once the table
 * collapses.
 */
export const Selectable: Story = {
  render: () => <SelectableStorage />,
}

interface Purchase {
  id: string
  item: string
  account: string
  date: string
  price: string
}

const purchases: Purchase[] = [
  { id: 'p1', item: 'Things 3', account: 'ada@icloud.com', date: '12 Feb 2025', price: '$49.99' },
  { id: 'p2', item: 'Apple One', account: 'ada@icloud.com', date: '9 Feb 2025', price: '$37.95' },
  { id: 'p3', item: 'Halide Mark II', account: 'ada@icloud.com', date: '2 Feb 2025', price: '$2.99' },
  { id: 'p4', item: 'Logic Pro', account: 'ada@icloud.com', date: '28 Jan 2025', price: '$199.99' },
  { id: 'p5', item: 'iCloud+ 2 TB', account: 'ada@icloud.com', date: '21 Jan 2025', price: '$9.99' },
  { id: 'p6', item: 'Dark Noise', account: 'ada@icloud.com', date: '18 Jan 2025', price: '$5.99' },
  { id: 'p7', item: 'Apple TV+', account: 'family@icloud.com', date: '14 Jan 2025', price: '$9.99' },
  { id: 'p8', item: 'Overcast Premium', account: 'ada@icloud.com', date: '11 Jan 2025', price: '$11.99' },
  { id: 'p9', item: 'Pixelmator Pro', account: 'ada@icloud.com', date: '3 Jan 2025', price: '$49.99' },
  { id: 'p10', item: 'Apple Arcade', account: 'family@icloud.com', date: '1 Jan 2025', price: '$6.99' },
  { id: 'p11', item: 'Craft', account: 'ada@icloud.com', date: '22 Dec 2024', price: '$44.99' },
  { id: 'p12', item: 'Weather Up', account: 'ada@icloud.com', date: '19 Dec 2024', price: '$3.99' },
]

const purchaseColumns: TableColumn<Purchase>[] = [
  { key: 'item', header: 'Item', primary: true },
  { key: 'account', header: 'Account' },
  { key: 'date', header: 'Date', width: 128 },
  { key: 'price', header: 'Price', numeric: true, width: 96 },
]

/**
 * Bounded, so the header has a scrollport to pin itself to. Zebra is off by
 * default — hairlines already group the rows — but earns its keep once a
 * ledger is long enough that the eye has to track across four columns.
 */
export const StickyLedger: Story = {
  render: () => (
    <Table
      caption="Purchase History"
      columns={purchaseColumns}
      data={purchases}
      rowKey="id"
      size="sm"
      zebra
      stickyHeader
      maxHeight={320}
    />
  ),
}

/** Row height comes from the control scale, so a dense table stays on the grid. */
export const Densities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Table
          key={size}
          caption={size}
          columns={storageColumns}
          data={storage.slice(0, 3)}
          rowKey="id"
          size={size}
        />
      ))}
    </div>
  ),
}

/** With no records the header stays put and the empty state takes the body. */
export const Empty: Story = {
  render: () => (
    <Table
      caption="Purchase History"
      columns={purchaseColumns}
      data={[]}
      rowKey="id"
      emptyState={
        <EmptyState
          title="No Purchases"
          description="Purchases made with this Apple Account appear here."
          glyph={
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden>
              <path
                d="M4 7h16l-1.4 12.1a2 2 0 0 1-2 1.9H7.4a2 2 0 0 1-2-1.9L4 7Zm4 0a4 4 0 1 1 8 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      }
    />
  ),
}
