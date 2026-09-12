import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SegmentedControl } from '.'

const meta = {
  title: 'Catalog/Adaptive/SegmentedControl',
  component: SegmentedControl,
  args: {
    'aria-label': 'Range',
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The thumb slides — and can be dragged across the control, selecting as it
 * goes. Both reference implementations cross-fade an indicator between
 * segments instead, which is the most conspicuous missing iOS motion.
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('day')
    return <SegmentedControl {...args} value={value} onValueChange={setValue} />
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', alignItems: 'flex-start' }}>
      <SegmentedControl {...args} size="sm" defaultValue="day" />
      <SegmentedControl {...args} size="md" defaultValue="week" />
      <SegmentedControl {...args} size="lg" defaultValue="month" />
    </div>
  ),
}

export const FullWidth: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <SegmentedControl {...args} fullWidth defaultValue="week" />
    </div>
  ),
}

export const ManySegments: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <SegmentedControl
        aria-label="Filter"
        fullWidth
        defaultValue="all"
        options={[
          { label: 'All', value: 'all' },
          { label: 'Unread', value: 'unread' },
          { label: 'Flagged', value: 'flagged' },
          { label: 'Archived', value: 'archived', disabled: true },
        ]}
      />
    </div>
  ),
}
