import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'
import { Stack } from '../Stack/Stack'

const tones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const

const meta = {
  title: 'Data display/Badge',
  component: Badge,
  args: { children: 'Active' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={3}>
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Stack key={variant} direction="horizontal" gap={2} wrap>
          {tones.map((tone) => (
            <Badge {...args} key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

export const WithDot: Story = {
  render: () => (
    <Stack direction="horizontal" gap={2}>
      <Badge tone="success" dot>Operational</Badge>
      <Badge tone="warning" dot>Degraded</Badge>
      <Badge tone="danger" dot>Outage</Badge>
    </Stack>
  ),
}
