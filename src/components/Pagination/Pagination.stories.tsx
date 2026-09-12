import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Pagination } from '.'

const meta = {
  title: 'Catalog/Adaptive/Pagination',
  component: Pagination,
  args: {
    page: 1,
    pageCount: 12,
    onPageChange: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The current page is a fill that springs into place as it lands — never a
 * ring, and never a colour swap you have to catch in the act.
 */
export const Default: Story = {
  render: (args) => {
    const [page, setPage] = useState(3)
    return <Pagination {...args} page={page} onPageChange={setPage} />
  },
}

/**
 * The window is a fixed width: the ellipsis crosses from one side to the other
 * as you page, but the row never changes size under the finger.
 */
export const Windowing: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      {[1, 4, 8, 24].map((page) => (
        <Pagination {...args} key={page} page={page} pageCount={24} />
      ))}
    </div>
  ),
}

/** A wider sibling window, for a search-results footer with room to spare. */
export const WideWindow: Story = {
  args: { page: 12, pageCount: 40, siblingCount: 2 },
}

/**
 * Twelve keys do not fit across a phone. `compact` counts instead, keeping the
 * two arrows where the thumb already is.
 */
export const Compact: Story = {
  render: (args) => {
    const [page, setPage] = useState(3)
    return (
      <div style={{ maxWidth: 320 }}>
        <Pagination {...args} compact page={page} onPageChange={setPage} />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <Pagination {...args} size="sm" page={2} pageCount={8} />
      <Pagination {...args} size="md" page={2} pageCount={8} />
      <Pagination {...args} size="lg" page={2} pageCount={8} />
    </div>
  ),
}
