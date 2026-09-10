import { useMemo, useState } from 'react'
import { DataTable } from '../desktop/DataTable'
import type { DataTableColumn } from '../desktop/DataTable'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { IconButton } from '../components/IconButton'
import { Menu } from '../components/Menu'
import { SearchField } from '../components/SearchField'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

/** App Store Connect's own role vocabulary, not an invented one. */
type Role =
  | 'Account Holder'
  | 'Admin'
  | 'App Manager'
  | 'Developer'
  | 'Marketing'
  | 'Finance'
  | 'Customer Support'

type Status = 'Active' | 'Invited' | 'Suspended'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  /**
   * The sortable truth behind the human string. "3 days ago" sorts
   * alphabetically into nonsense, so the column reads this instead and
   * renders `lastActive` — the split every relative-time column needs.
   */
  lastActiveMinutes: number
  lastActive: string
}

const members: Member[] = [
  { id: 'u1', name: 'Priya Raghunathan', email: 'priya@mercuryapp.com', role: 'Account Holder', status: 'Active', lastActiveMinutes: 2, lastActive: '2 minutes ago' },
  { id: 'u2', name: 'Daniel Okafor', email: 'daniel@mercuryapp.com', role: 'Admin', status: 'Active', lastActiveMinutes: 26, lastActive: '26 minutes ago' },
  { id: 'u3', name: 'Mei-Ling Chen', email: 'meiling@mercuryapp.com', role: 'App Manager', status: 'Active', lastActiveMinutes: 95, lastActive: '1 hour ago' },
  { id: 'u4', name: 'Tomás Ferreira', email: 'tomas@mercuryapp.com', role: 'Developer', status: 'Active', lastActiveMinutes: 240, lastActive: '4 hours ago' },
  { id: 'u5', name: 'Hannah Lindqvist', email: 'hannah@mercuryapp.com', role: 'Marketing', status: 'Active', lastActiveMinutes: 55, lastActive: '55 minutes ago' },
  { id: 'u6', name: 'Yusuf Demir', email: 'yusuf@mercuryapp.com', role: 'Developer', status: 'Suspended', lastActiveMinutes: 2_880, lastActive: '2 days ago' },
  { id: 'u7', name: 'Clara Bianchi', email: 'clara@mercuryapp.com', role: 'Customer Support', status: 'Active', lastActiveMinutes: 420, lastActive: '7 hours ago' },
  { id: 'u8', name: 'Rohan Mehta', email: 'rohan@mercuryapp.com', role: 'Developer', status: 'Active', lastActiveMinutes: 1_440, lastActive: 'Yesterday' },
  { id: 'u9', name: 'Sofia Alvarez', email: 'sofia@mercuryapp.com', role: 'Finance', status: 'Active', lastActiveMinutes: 4_320, lastActive: '3 days ago' },
  { id: 'u10', name: 'Noah Whitfield', email: 'noah@mercuryapp.com', role: 'Developer', status: 'Invited', lastActiveMinutes: 20_160, lastActive: 'Never' },
  { id: 'u11', name: 'Aiko Tanaka', email: 'aiko@mercuryapp.com', role: 'App Manager', status: 'Active', lastActiveMinutes: 10_080, lastActive: 'Last week' },
  { id: 'u12', name: 'Leo Kowalski', email: 'leo@mercuryapp.com', role: 'Marketing', status: 'Invited', lastActiveMinutes: 20_160, lastActive: 'Never' },
  { id: 'u13', name: 'Fatima Zahra', email: 'fatima@mercuryapp.com', role: 'Customer Support', status: 'Active', lastActiveMinutes: 12, lastActive: '12 minutes ago' },
  { id: 'u14', name: 'Erik Sandberg', email: 'erik@mercuryapp.com', role: 'Developer', status: 'Suspended', lastActiveMinutes: 43_200, lastActive: 'A month ago' },
]

const STATUS_TONE = {
  Active: 'success',
  Invited: 'tint',
  Suspended: 'danger',
} as const

const glyphs = {
  plus: 'M8 3.5v9M3.5 8h9',
  more: 'M4 8h.01M8 8h.01M12 8h.01',
  chevron: 'M4 6.5L8 10.5l4-4',
  people: 'M8 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 13.5a5.5 5.5 0 0 1 11 0',
}

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ------------------------------------------------------------------ *
 * Screen
 * ------------------------------------------------------------------ */

/**
 * The Users and Access page of a developer account: the shape almost
 * every admin console lands on — a toolbar that narrows the set, then a
 * table that acts on it.
 *
 * Two things are load-bearing rather than cosmetic. `maxHeight` is what
 * gives `stickyHeader` a scrollport to pin against; without it the head
 * would look sticky and never stick. And `pageSize` is what puts the
 * Pagination footer under the card, so fourteen people arrive as two
 * readable pages instead of one long scroll.
 *
 * No transform on the root: the per-row Menu is measured against the
 * real viewport and would otherwise open somewhere else entirely.
 */
export function DataTableAdminScreen() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(['u2', 'u13'])

  /* The toolbar search spans name, address and role; the per-column
   * filters in the header row narrow whatever survives it. */
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return members
    return members.filter((member) =>
      `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(needle),
    )
  }, [query])

  const columns = useMemo<DataTableColumn<Member>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        filter: 'text',
        minWidth: 240,
        width: 300,
        value: (row) => row.name,
        render: (row) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-3)', minWidth: 0 }}>
            {/* No src: Avatar derives the initials AND a stable hue from the
             * name, so a roster of fourteen is legible without a single
             * uploaded image. */}
            <Avatar name={row.name} size="sm" />
            <span style={{ display: 'grid', gap: 'var(--may-space-1)', minWidth: 0 }}>
              <Text as="span" variant="subheadline" weight="medium" clamp={1}>
                {row.name}
              </Text>
              <Text as="span" variant="footnote" tone="secondary" clamp={1}>
                {row.email}
              </Text>
            </span>
          </span>
        ),
      },
      { key: 'role', header: 'Role', filter: 'select', width: 150 },
      {
        key: 'status',
        header: 'Status',
        filter: 'select',
        width: 140,
        value: (row) => row.status,
        render: (row) => (
          <Badge tone={STATUS_TONE[row.status]} dot>
            {row.status}
          </Badge>
        ),
      },
      {
        key: 'lastActive',
        header: 'Last Active',
        numeric: true,
        width: 160,
        // Sorts on minutes, prints the phrase.
        value: (row) => row.lastActiveMinutes,
        render: (row) => (
          <Text as="span" variant="subheadline" tone="secondary">
            {row.lastActive}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 64,
        minWidth: 64,
        sortable: false,
        resizable: false,
        align: 'end',
        render: (row) => (
          <Menu
            aria-label={`Actions for ${row.name}`}
            placement="bottom-end"
            trigger={
              <IconButton aria-label={`Actions for ${row.name}`} tone="neutral" size="sm">
                <Glyph d={glyphs.more} />
              </IconButton>
            }
            items={[
              { label: 'View Profile', shortcut: '⌘I' },
              { label: 'Change Role…' },
              {
                label: row.status === 'Invited' ? 'Resend Invitation' : 'Reset Password',
                separator: true,
              },
              {
                label: row.status === 'Suspended' ? 'Restore Access' : 'Suspend Access',
                // The account holder cannot be locked out of their own
                // account — the item stays visible so the rule is legible.
                disabled: row.role === 'Account Holder',
              },
              { label: 'Remove Access', destructive: true, separator: true },
            ]}
          />
        ),
      },
    ],
    [],
  )

  const count = selected.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '34rem',
        background: 'var(--may-color-bg)',
      }}
    >
      <div
        data-slot="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: 'var(--may-space-6)',
        }}
      >
        <Stack gap={5}>
          <Stack gap={1}>
            <Text as="h1" variant="title-1">
              Users and Access
            </Text>
            <Text variant="subheadline" tone="secondary">
              Mercury, Inc. · 14 people · 2 invitations pending
            </Text>
          </Stack>

          {/* ------------------------------ toolbar ----------------------------- */}
          <Stack direction="row" gap={3} align="center" wrap>
            <div style={{ flex: 1, minWidth: 'calc(var(--may-space-24) * 3)' }}>
              <SearchField
                placeholder="Search people"
                value={query}
                onValueChange={setQuery}
                fullWidth
                aria-label="Search people"
              />
            </div>

            {/* Bulk actions read the selection rather than a row, so every
             * item disables itself when nothing is ticked — the menu still
             * opens, which is how a user finds out what selecting is for. */}
            <Menu
              aria-label="Bulk actions"
              placement="bottom-end"
              trigger={
                <Button variant="gray" trailingIcon={<Glyph d={glyphs.chevron} />}>
                  {count > 0 ? `${count} Selected` : 'Bulk Actions'}
                </Button>
              }
              items={[
                { label: 'Change Role…', disabled: count === 0 },
                { label: 'Resend Invitations', disabled: count === 0 },
                { label: 'Export as CSV…', shortcut: '⇧⌘E', separator: true },
                {
                  label: count > 1 ? `Remove ${count} People` : 'Remove Access',
                  destructive: true,
                  disabled: count === 0,
                  separator: true,
                },
              ]}
            />

            <Button variant="filled" leadingIcon={<Glyph d={glyphs.plus} />}>
              Invite
            </Button>
          </Stack>

          {/* ------------------------------- table ------------------------------ */}
          {/* Ten control-heights of scrollport: enough that the eighth row of
           * a page is visible under the pinned header, and the footer still
           * lands above the fold. */}
          <DataTable
            caption="People"
            columns={columns}
            data={visible}
            rowKey="id"
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            resizableColumns
            stickyHeader
            maxHeight="calc(var(--may-control-h) * 10)"
            zebra
            pageSize={8}
            defaultSort={[{ key: 'lastActive', direction: 'asc' }]}
            emptyState={
              <EmptyState
                glyph={<Glyph d={glyphs.people} />}
                title="No one matches that search"
                description={`No one in Mercury, Inc. matches “${query.trim()}”. Try a name, an email address, or a role.`}
                action={
                  <Button variant="tinted" onClick={() => setQuery('')}>
                    Clear Search
                  </Button>
                }
              />
            }
          />
        </Stack>
      </div>
    </div>
  )
}
