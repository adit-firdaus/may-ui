import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'
import { IoCloudOutline } from 'react-icons/io5'
import { DataTable } from './DataTable'
import type { DataTableColumn, DataTableProps } from './DataTable'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Button } from '../../components/Button/Button'
import { Tag } from '../../components/Tag/Tag'

interface Backup {
  id: string
  device: string
  kind: 'iPhone' | 'iPad' | 'Mac' | 'Watch'
  owner: string
  state: 'Complete' | 'In Progress' | 'Failed' | 'Paused'
  size: number
  updated: string
}

const backups: Backup[] = [
  { id: 'b1', device: "Ada's iPhone", kind: 'iPhone', owner: 'ada@icloud.com', state: 'Complete', size: 61.2, updated: '2 min ago' },
  { id: 'b2', device: 'Studio iPad', kind: 'iPad', owner: 'ada@icloud.com', state: 'In Progress', size: 12.4, updated: 'Just now' },
  { id: 'b3', device: 'MacBook Pro 14"', kind: 'Mac', owner: 'ada@icloud.com', state: 'Complete', size: 402.7, updated: 'Yesterday' },
  { id: 'b4', device: "Grace's iPhone", kind: 'iPhone', owner: 'grace@icloud.com', state: 'Failed', size: 8.1, updated: '3 days ago' },
  { id: 'b5', device: 'Apple Watch Ultra 2', kind: 'Watch', owner: 'ada@icloud.com', state: 'Complete', size: 2.4, updated: '6 min ago' },
  { id: 'b6', device: 'Kitchen iPad', kind: 'iPad', owner: 'family@icloud.com', state: 'Paused', size: 24.9, updated: '1 hr ago' },
  { id: 'b7', device: "Grace's MacBook Air", kind: 'Mac', owner: 'grace@icloud.com', state: 'Complete', size: 188.3, updated: '4 hr ago' },
  { id: 'b8', device: 'Studio Display', kind: 'Mac', owner: 'ada@icloud.com', state: 'Complete', size: 0.4, updated: 'Last week' },
]

const STATE_TONE = {
  Complete: 'success',
  'In Progress': 'tint',
  Failed: 'danger',
  Paused: 'neutral',
} as const

const backupColumns: DataTableColumn<Backup>[] = [
  { key: 'device', header: 'Device', filter: 'text', minWidth: 160 },
  { key: 'kind', header: 'Kind', filter: 'select', width: 120 },
  { key: 'owner', header: 'Apple Account', filter: 'text' },
  {
    key: 'state',
    header: 'Status',
    filter: 'select',
    width: 140,
    render: (row) => (
      <Tag tone={STATE_TONE[row.state]} size="sm">
        {row.state}
      </Tag>
    ),
  },
  {
    key: 'size',
    header: 'Size',
    numeric: true,
    width: 110,
    // The rendered string carries a unit; sorting must see the number, or
    // "8.1 GB" lands above "402.7 GB".
    render: (row) => `${row.size.toFixed(1)} GB`,
  },
  { key: 'updated', header: 'Last Backup', width: 140, sortable: false },
]

const meta = {
  title: 'Catalog/Desktop/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  args: {
    columns: backupColumns,
    data: backups,
    rowKey: 'id',
    caption: 'iCloud Backups',
    maxHeight: 420,
  },
} satisfies Meta<DataTableProps<Backup>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Click a header to sort it, click again to reverse, a third time to clear.
 * **Shift-click** a second header to sort by both — the ordinal beside each
 * glyph shows which key wins. Typing in the filter row narrows the set, and the
 * count in the footer says how much was removed.
 */
export const Backups: Story = {}

/**
 * Selection is controlled here, the way it usually is in an app that has to act
 * on it. The header box covers every row that survives the filters, not only
 * the page under it — filter to `Mac`, tick the box, and the two Macs are what
 * you get.
 */
export const Selection: Story = {
  render: () => <SelectableBackups />,
}

function SelectableBackups() {
  const [selected, setSelected] = useState<string[]>(['b1', 'b5'])

  return (
    <>
      <DataTable
        caption="iCloud Backups"
        columns={backupColumns}
        data={backups}
        rowKey="id"
        maxHeight={420}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        defaultSort={[{ key: 'size', direction: 'desc' }]}
      />
      <div style={{ marginBlockStart: 'var(--may-space-4)' }}>
        <Button variant="tinted" tone="danger" disabled={selected.length === 0}>
          Delete {selected.length || ''} Backup{selected.length === 1 ? '' : 's'}
        </Button>
      </div>
    </>
  )
}

/**
 * Both axes pinned, with columns you can resize.
 *
 * Drag the hairline beside any header — or focus it with Tab and use the arrow
 * keys. The table auto-sizes once under the browser's own layout, then switches
 * to fixed layout so an edge you drag actually stays where you left it. Scroll
 * sideways and the leading columns hold, picking up their edge only once there
 * is something behind them.
 */
export const PinnedAndResizable: Story = {
  render: () => (
    <DataTable
      caption="iCloud Backups"
      data={backups}
      rowKey="id"
      maxHeight={420}
      selectable
      resizableColumns
      stickyColumn
      size="sm"
      zebra
      defaultSelectedKeys={['b3']}
      columns={[
        ...backupColumns,
        { key: 'region', header: 'Region', width: 160, render: () => 'US East (Ashburn)' },
        { key: 'retention', header: 'Retention', width: 140, render: () => '30 days' },
        { key: 'encryption', header: 'Encryption', width: 180, render: () => 'End-to-end' },
      ]}
    />
  ),
}

interface Transaction {
  id: string
  merchant: string
  category: string
  card: string
  date: string
  amount: number
}

const CATEGORIES = ['Groceries', 'Transport', 'Software', 'Dining', 'Utilities', 'Travel']
const MERCHANTS = [
  'Blue Bottle Coffee',
  'Whole Foods Market',
  'Transit Authority',
  'Apple Services',
  'Dark Horse Books',
  'Pacific Gas & Electric',
  'Osteria Mozza',
  'Sunset Hardware',
]

/** Ten thousand rows, so the virtualiser has something to prove. */
function useTransactions(): Transaction[] {
  return useMemo(
    () =>
      Array.from({ length: 10_000 }, (_, i) => ({
        id: `t${i}`,
        merchant: MERCHANTS[i % MERCHANTS.length]!,
        category: CATEGORIES[i % CATEGORIES.length]!,
        card: i % 3 === 0 ? 'Apple Card' : 'Apple Card Family',
        date: new Date(2025, 0, 1 + (i % 364)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        amount: Math.round(((i * 37) % 24_000) + 240) / 100,
      })),
    [],
  )
}

const transactionColumns: DataTableColumn<Transaction>[] = [
  { key: 'merchant', header: 'Merchant', filter: 'text', minWidth: 200 },
  { key: 'category', header: 'Category', filter: 'select', width: 160 },
  { key: 'card', header: 'Card', filter: 'select', width: 180 },
  { key: 'date', header: 'Date', width: 120, sortable: false },
  {
    key: 'amount',
    header: 'Amount',
    numeric: true,
    width: 120,
    render: (row) => `$${row.amount.toFixed(2)}`,
  },
]

function VirtualLedger() {
  const data = useTransactions()
  return (
    <DataTable
      caption="Apple Card Transactions"
      columns={transactionColumns}
      data={data}
      rowKey="id"
      size="sm"
      virtualized
      stickyColumn
      maxHeight={440}
      defaultSort={[{ key: 'merchant', direction: 'asc' }, { key: 'amount', direction: 'desc' }]}
      zebra
    />
  )
}

/**
 * Ten thousand rows, windowed. Only what fits plus a small overscan is in the
 * DOM; the rows above and below are one spacer each. Row height is measured off
 * the first real row rather than assumed, so a table at `sm` and one at `lg`
 * both scroll to exactly the right offset.
 *
 * It opens sorted by merchant, then by amount descending — the two-key case the
 * ordinals beside the glyphs exist to explain.
 */
export const Virtualised: Story = {
  render: () => <VirtualLedger />,
}

function PagedLedger() {
  const data = useTransactions().slice(0, 240)
  return (
    <DataTable
      caption="Apple Card Transactions"
      columns={transactionColumns}
      data={data}
      rowKey="id"
      size="sm"
      selectable
      pageSize={12}
      maxHeight={520}
    />
  )
}

/**
 * The other answer to a long table. Paging suits a set someone reads through
 * rather than scans, and it keeps the selection count and the pager on one
 * footer line. Filtering re-pages from the top rather than stranding you on
 * page nine of two.
 */
export const Paged: Story = {
  render: () => <PagedLedger />,
}

/**
 * An empty table and a filtered-out table are different states. Filter this one
 * to something that matches nothing and the copy changes — telling someone "No
 * Backups" while their own filter is sitting in the box above is a support
 * ticket waiting to happen.
 */
export const Empty: Story = {
  render: (args) => (
    <DataTable
      {...args}
      data={[]}
      emptyState={
        <EmptyState
          title="No Backups"
          description="Backups of the devices signed in to this Apple Account appear here."
          glyph={<IoCloudOutline aria-hidden />}
        />
      }
      noResultsState={
        <EmptyState
          size="sm"
          title="No Matching Backups"
          description="No backup matches the filters in the row above."
        />
      }
    />
  ),
}
