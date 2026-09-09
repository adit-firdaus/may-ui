import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './Progress'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  args: { value: 64, 'aria-label': 'Upload progress' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Progress {...args} />
    </div>
  ),
}

export const WithValue: Story = {
  render: (args) => (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Progress {...args} value={22} showValue />
      <Progress {...args} value={64} showValue tone="info" />
      <Progress {...args} value={100} showValue tone="success" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Progress {...args} size="sm" />
      <Progress {...args} size="md" />
      <Progress {...args} size="lg" />
    </Stack>
  ),
}

export const Indeterminate: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Progress aria-label="Loading" />
    </div>
  ),
}
