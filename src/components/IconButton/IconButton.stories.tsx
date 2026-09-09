import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from './IconButton'
import { Stack } from '../Stack/Stack'

const TrashIcon = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const meta = {
  title: 'Actions/IconButton',
  component: IconButton,
  args: { icon: TrashIcon, 'aria-label': 'Delete item' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3}>
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} variant="soft" />
      <IconButton {...args} variant="outline" />
      <IconButton {...args} variant="solid" tone="danger" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3}>
      <IconButton {...args} size="sm" variant="outline" />
      <IconButton {...args} size="md" variant="outline" />
      <IconButton {...args} size="lg" variant="outline" />
      <IconButton {...args} size="md" variant="outline" round />
    </Stack>
  ),
}
