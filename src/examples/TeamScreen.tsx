import { useMemo, useState } from 'react'
import {
  IoEllipsisHorizontal,
  IoPersonAddOutline,
  IoPersonOutline,
  IoPersonRemoveOutline,
} from 'react-icons/io5'
import { DataTable } from '../desktop/DataTable'
import type { DataTableColumn } from '../desktop/DataTable'
import { Avatar, AvatarGroup } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Field } from '../components/Field'
import { Heading } from '../components/Heading'
import { IconButton } from '../components/IconButton'
import { Input } from '../components/Input'
import { Menu } from '../components/Menu'
import type { MenuItem } from '../components/Menu'
import { Modal } from '../components/Modal'
import { SegmentedControl } from '../components/SegmentedControl'
import { Select } from '../components/Select'
import { Tag } from '../components/Tag'
import { Text } from '../components/Text'
import { Tooltip } from '../components/Tooltip'
import { VisuallyHidden } from '../components/VisuallyHidden'
import { MayHost, toast } from '../components/Toast'

/**
 * The members page every team admin has seen: who is here, what they can do,
 * and the one row-level action you have to be sure about.
 *
 * Three composition notes worth stealing:
 *
 *  - The filter above the table is a `SegmentedControl`, not a row of buttons.
 *    It narrows the *set*; the per-column filters inside the table narrow the
 *    *rows*, and keeping those two jobs on different controls is what stops an
 *    admin page turning into a wall of dropdowns.
 *  - `toast()` is imperative, so `<MayHost />` is mounted once at the bottom of
 *    the screen. Without it the calls are silent.
 *  - Every destructive action lives behind a `Menu`, never in the row itself.
 */

type Role = 'Owner' | 'Admin' | 'Member' | 'Pending'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  teams: string[]
  lastActive: string
  /** Minutes since the last session — what sorting actually compares. */
  activeMinutes: number
}

const MEMBERS: Member[] = [
  {
    id: 'u1',
    name: 'Ada Lovelace',
    email: 'ada@mayui.dev',
    role: 'Owner',
    teams: ['Design Systems', 'Platform'],
    lastActive: '2 minutes ago',
    activeMinutes: 2,
  },
  {
    id: 'u2',
    name: 'Grace Hopper',
    email: 'grace@mayui.dev',
    role: 'Admin',
    teams: ['Platform', 'Tooling'],
    lastActive: '18 minutes ago',
    activeMinutes: 18,
  },
  {
    id: 'u3',
    name: 'Katherine Johnson',
    email: 'katherine@mayui.dev',
    role: 'Admin',
    teams: ['Research'],
    lastActive: '1 hour ago',
    activeMinutes: 62,
  },
  {
    id: 'u4',
    name: 'Margaret Hamilton',
    email: 'margaret@mayui.dev',
    role: 'Member',
    teams: ['Platform'],
    lastActive: '3 hours ago',
    activeMinutes: 194,
  },
  {
    id: 'u5',
    name: 'Radia Perlman',
    email: 'radia@mayui.dev',
    role: 'Member',
    teams: ['Design Systems', 'Docs'],
    lastActive: 'Yesterday',
    activeMinutes: 1_460,
  },
  {
    id: 'u6',
    name: 'Hedy Lamarr',
    email: 'hedy@mayui.dev',
    role: 'Member',
    teams: ['Research', 'Docs'],
    lastActive: '2 days ago',
    activeMinutes: 2_980,
  },
  {
    id: 'u7',
    name: 'Barbara Liskov',
    email: 'barbara@mayui.dev',
    role: 'Member',
    teams: ['Tooling'],
    lastActive: 'Last week',
    activeMinutes: 9_120,
  },
  {
    id: 'u8',
    name: 'Sophie Wilson',
    email: 'sophie@mayui.dev',
    role: 'Pending',
    teams: ['Platform'],
    lastActive: 'Invited 2 days ago',
    activeMinutes: 999_999,
  },
  {
    id: 'u9',
    name: 'Karen Spärck Jones',
    email: 'karen@mayui.dev',
    role: 'Pending',
    teams: ['Research'],
    lastActive: 'Invited 6 hours ago',
    activeMinutes: 999_999,
  },
]

const ROLE_TONE = {
  Owner: 'tint',
  Admin: 'success',
  Member: 'neutral',
  Pending: 'warning',
} as const

const SCOPES = [
  { label: 'All', value: 'all' },
  { label: 'Admins', value: 'admins' },
  { label: 'Pending', value: 'pending' },
]

const ROLE_OPTIONS = [
  { label: 'Member — can view and comment', value: 'member' },
  { label: 'Admin — can manage members', value: 'admin' },
  { label: 'Billing — can manage the plan', value: 'billing' },
]

export function TeamScreen() {
  const [scope, setScope] = useState('all')
  const [inviting, setInviting] = useState(false)
  const [sending, setSending] = useState(false)

  const data = useMemo(
    () =>
      MEMBERS.filter((member) =>
        scope === 'admins'
          ? member.role === 'Admin' || member.role === 'Owner'
          : scope === 'pending'
            ? member.role === 'Pending'
            : true,
      ),
    [scope],
  )

  /**
   * The round trip a real invite makes. `loading` keeps the button's own label
   * in place under the spinner, so the footer does not change width mid-send.
   */
  function send() {
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      setInviting(false)
      toast('Invitation sent', {
        tone: 'success',
        description: 'They will show as Pending until the link is accepted.',
      })
    }, 900)
  }

  const columns: DataTableColumn<Member>[] = [
    {
      key: 'name',
      header: 'Member',
      filter: 'text',
      width: 280,
      minWidth: 220,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-3)' }}>
          <Avatar name={row.name} size="sm" />
          <div style={{ minWidth: 0 }}>
            <Text variant="subheadline" weight="semibold" clamp={1}>
              {row.name}
            </Text>
            <Text variant="caption-1" tone="secondary" clamp={1}>
              {row.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      filter: 'select',
      width: 120,
      render: (row) => <Badge tone={ROLE_TONE[row.role]}>{row.role}</Badge>,
    },
    {
      key: 'teams',
      header: 'Teams',
      sortable: false,
      minWidth: 200,
      // The raw property is an array, so the column has to say what a filter and
      // a sort should compare — otherwise it reads "[object Object]".
      value: (row) => row.teams.join(', '),
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--may-space-1)' }}>
          {row.teams.map((team) => (
            <Tag key={team} size="sm">
              {team}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      key: 'lastActive',
      header: 'Last active',
      width: 160,
      // Sorting must see the minutes, or "Yesterday" lands above "2 minutes ago".
      value: (row) => row.activeMinutes,
      render: (row) => (
        <Text as="span" variant="footnote" tone="secondary">
          {row.lastActive}
        </Text>
      ),
    },
    {
      key: 'actions',
      // An actions column shows no header, but a `<th>` with no accessible name
      // leaves the whole column anonymous to a screen reader.
      header: <VisuallyHidden>Actions</VisuallyHidden>,
      width: 56,
      minWidth: 56,
      sortable: false,
      resizable: false,
      align: 'end',
      render: (row) => (
        <Menu
          aria-label={`Actions for ${row.name}`}
          placement="bottom-end"
          trigger={
            <IconButton aria-label={`Actions for ${row.name}`} size="sm" tone="neutral">
              <IoEllipsisHorizontal aria-hidden />
            </IconButton>
          }
          items={rowActions(row)}
        />
      ),
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
      <div data-slot="scroll-area" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            padding: 'var(--may-space-8) var(--may-space-6) var(--may-space-12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--may-space-6)',
          }}
        >
          {/* ------------------------------ header ----------------------------- */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--may-space-4)',
            }}
          >
            <div style={{ flex: 1, minWidth: '16rem' }}>
              <Heading level={1} size="title-1">
                Members
              </Heading>
              <Text variant="subheadline" tone="secondary">
                {MEMBERS.length} people in Design Systems · 3 seats left on the Team plan
              </Text>
            </div>

            {/* AvatarGroup punches the gap between avatars out of the layer
                underneath rather than drawing a ring, so it stays correct on
                whatever surface it lands on. */}
            <AvatarGroup max={5} size="sm">
              {MEMBERS.map((member) => (
                <Avatar key={member.id} name={member.name} />
              ))}
            </AvatarGroup>

            {/* Tooltip describes; the button's own label names. Both are needed —
                a tooltip never appears on touch. */}
            <Tooltip label="Invite by email — ⇧⌘I">
              <Button leadingIcon={<IoPersonAddOutline aria-hidden />} onClick={() => setInviting(true)}>
                Invite member
              </Button>
            </Tooltip>
          </div>

          <SegmentedControl
            aria-label="Filter members"
            options={SCOPES}
            value={scope}
            onValueChange={setScope}
          />

          {/* `stickyHeader` is on by default but does nothing without a
              `maxHeight` to give it a scrollport to pin against. */}
          <DataTable
            columns={columns}
            data={data}
            rowKey="id"
            maxHeight="30rem"
            emptyState={
              <EmptyState
                title="No one here yet"
                description="Invite a teammate and they will show up as soon as they accept."
              />
            }
            noResultsState={
              <EmptyState
                title="No matching members"
                description="Clear the column filters to see everyone again."
              />
            }
          />
        </div>
      </div>

      {/* ------------------------------- invite ------------------------------- */}
      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite member"
        description="They will get an email with a link that expires in 7 days."
        footer={
          <>
            <Button variant="gray" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button loading={sending} onClick={send}>
              Send invite
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
          {/* Field supplies the id, the label wiring and the invalid state to
              whatever single control sits inside it. */}
          <Field label="Email address" description="Use their work address.">
            <Input type="email" placeholder="name@mayui.dev" fullWidth autoComplete="email" />
          </Field>
          <Field label="Role" description="Admins can add and remove members.">
            <Select fullWidth options={ROLE_OPTIONS} defaultValue="member" />
          </Field>
        </div>
      </Modal>

      {/* One mount point for every imperative surface on the screen. */}
      <MayHost />
    </div>
  )
}

/* --------------------------------- row menu -------------------------------- */

function rowActions(member: Member): MenuItem[] {
  return [
    { label: 'View profile', icon: <IoPersonOutline aria-hidden />, onSelect: () => {} },
    { label: 'Change role…', shortcut: '⌘E', onSelect: () => {} },
    {
      label: 'Resend invitation',
      separator: true,
      disabled: member.role !== 'Pending',
      onSelect: () => toast(`Invitation resent to ${member.email}`),
    },
    {
      label: 'Transfer ownership…',
      disabled: member.role === 'Owner',
      onSelect: () => {},
    },
    {
      label: 'Remove from team',
      icon: <IoPersonRemoveOutline aria-hidden />,
      shortcut: '⌘⌫',
      destructive: true,
      separator: true,
      // The owner cannot be removed, so the row that would break the team is
      // disabled rather than merely warned about.
      disabled: member.role === 'Owner',
      onSelect: () =>
        toast(`${member.name} removed from Design Systems`, {
          tone: 'danger',
          action: { label: 'Undo', onClick: () => {} },
        }),
    },
  ]
}
