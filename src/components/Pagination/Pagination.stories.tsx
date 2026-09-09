import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Pagination } from './Pagination'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 8, onPageChange: () => {} },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    return (
      <Stack gap={4}>
        <Pagination page={page} pageCount={8} onPageChange={setPage} />
        <Text tone="muted" size="sm">Showing page {page} of 8</Text>
      </Stack>
    )
  },
}

export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = useState(23)
    return <Pagination page={page} pageCount={50} onPageChange={setPage} />
  },
}

export const Small: Story = {
  render: () => {
    const [page, setPage] = useState(3)
    return <Pagination page={page} pageCount={12} onPageChange={setPage} size="sm" />
  },
}
