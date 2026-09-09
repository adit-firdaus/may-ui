import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { Stack } from '../Stack/Stack'

const InfoIcon = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 7.5v3.5M8 5.2v.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  args: { content: 'A short hint.', children: <Button>Hover me</Button> },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Deploys the current branch to production.',
    children: <Button>Deploy</Button>,
  },
}

export const Placements: Story = {
  render: () => (
    <Stack direction="horizontal" gap={6} style={{ padding: 60 }}>
      <Tooltip content="Above" placement="top"><Button variant="outline" tone="neutral">Top</Button></Tooltip>
      <Tooltip content="Below" placement="bottom"><Button variant="outline" tone="neutral">Bottom</Button></Tooltip>
      <Tooltip content="To the left" placement="left"><Button variant="outline" tone="neutral">Left</Button></Tooltip>
      <Tooltip content="To the right" placement="right"><Button variant="outline" tone="neutral">Right</Button></Tooltip>
    </Stack>
  ),
}

export const AlwaysOpen: Story = {
  args: {
    content: 'Forced open so the bubble is visible in a screenshot.',
    open: true,
    children: <IconButton icon={InfoIcon} aria-label="More information" variant="outline" />,
  },
  decorators: [(Story) => <div style={{ padding: 60 }}><Story /></div>],
}
