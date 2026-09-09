import type { Meta, StoryObj } from '@storybook/react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table'
import { Badge } from '../Badge/Badge'
import { Avatar } from '../Avatar/Avatar'
import { Stack } from '../Stack/Stack'

const rows = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'Active', usage: 1284 },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'Active', usage: 942 },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'Member', status: 'Invited', usage: 0 },
  { name: 'Katherine Johnson', email: 'kj@example.com', role: 'Member', status: 'Active', usage: 318 },
]

const meta = {
  title: 'Data display/Table',
  component: Table,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Table {...args} hoverable>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell numeric>Requests</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.email}>
            <TableCell>
              <Stack direction="horizontal" gap={3} align="center">
                <Avatar name={row.name} size="sm" />
                <Stack gap={0}>
                  <span>{row.name}</span>
                  <span style={{ color: 'var(--may-color-text-muted)', fontSize: 'var(--may-font-size-sm)' }}>
                    {row.email}
                  </span>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell>
              <Badge tone={row.status === 'Active' ? 'success' : 'neutral'} dot>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell numeric>{row.usage.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table striped size="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell numeric>Requests</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.email}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell numeric>{row.usage.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithSelection: Story = {
  render: () => (
    <Table hoverable>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={row.email} selected={index === 1}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
