import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Actions/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost', 'link'] },
    tone: { control: 'select', options: ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3} wrap>
      <Button {...args} variant="solid">Solid</Button>
      <Button {...args} variant="soft">Soft</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="link">Link</Button>
    </Stack>
  ),
}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={3} wrap>
        <Button {...args} tone="brand">Brand</Button>
        <Button {...args} tone="neutral">Neutral</Button>
        <Button {...args} tone="success">Success</Button>
        <Button {...args} tone="warning">Warning</Button>
        <Button {...args} tone="danger">Danger</Button>
        <Button {...args} tone="info">Info</Button>
      </Stack>
      <Stack direction="horizontal" gap={3} wrap>
        <Button {...args} variant="soft" tone="brand">Brand</Button>
        <Button {...args} variant="soft" tone="neutral">Neutral</Button>
        <Button {...args} variant="soft" tone="success">Success</Button>
        <Button {...args} variant="soft" tone="warning">Warning</Button>
        <Button {...args} variant="soft" tone="danger">Danger</Button>
        <Button {...args} variant="soft" tone="info">Info</Button>
      </Stack>
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </Stack>
  ),
}

export const States: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3} wrap>
      <Button {...args}>Default</Button>
      <Button {...args} loading>Saving</Button>
      <Button {...args} disabled>Disabled</Button>
      <Button {...args} fullWidth={false} leadingIcon={<PlusIcon />}>With icon</Button>
    </Stack>
  ),
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
