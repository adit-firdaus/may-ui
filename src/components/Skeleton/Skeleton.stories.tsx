import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'
import { Stack } from '../Stack/Stack'
import { Card } from '../Card/Card'

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 380 }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="block" />
      <Skeleton variant="circle" />
    </Stack>
  ),
}

export const LoadingCard: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <Card>
        <Stack direction="horizontal" gap={3} align="center">
          <Skeleton variant="circle" width="40px" height="40px" />
          <Stack gap={2} fullWidth>
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="70%" />
          </Stack>
        </Stack>
        <Skeleton variant="block" height="120px" />
        <Skeleton variant="text" lines={2} />
      </Card>
    </div>
  ),
}
