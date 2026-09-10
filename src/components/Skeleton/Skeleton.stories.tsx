import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Catalog/Adaptive/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'block', 'circle'] },
    lines: { control: { type: 'range', min: 1, max: 6, step: 1 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { lines: 3 },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Skeleton {...args} />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)', maxWidth: 420 }}>
      <Skeleton variant="text" lines={3} label="Loading article" />
      <Skeleton variant="block" height={120} radius="card" />
      <div style={{ display: 'flex', gap: 'var(--may-space-4)', alignItems: 'center' }}>
        <Skeleton variant="circle" width={28} />
        <Skeleton variant="circle" width={44} />
        <Skeleton variant="circle" width={64} />
      </div>
    </div>
  ),
}

/** Mail, mid-refresh. The silhouette has to match the rows it becomes. */
export const MailList: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        overflow: 'hidden',
      }}
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          style={{
            display: 'flex',
            gap: 'var(--may-space-3)',
            alignItems: 'flex-start',
            padding: 'var(--may-space-3) var(--may-space-4)',
            minHeight: 'var(--may-control-h)',
          }}
        >
          <Skeleton variant="circle" width={36} />
          <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 'var(--may-space-2)' }}>
            <Skeleton variant="text" width={row % 2 ? '48%' : '38%'} />
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
      ))}
    </div>
  ),
}

/** A Photos grid before the thumbnails decode. */
export const MediaGrid: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--may-space-1)',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} variant="block" height={110} radius="xs" />
      ))}
    </div>
  ),
}
