import type { Meta, StoryObj } from '@storybook/react'
import { Text } from './Text'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Typography/Text',
  component: Text,
  args: { children: 'The quick brown fox jumps over the lazy dog.' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Text {...args} size="xs" />
      <Text {...args} size="sm" />
      <Text {...args} size="md" />
      <Text {...args} size="lg" />
      <Text {...args} size="xl" />
    </Stack>
  ),
}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={2}>
      <Text {...args} tone="default" />
      <Text {...args} tone="muted" />
      <Text {...args} tone="subtle" />
      <Text {...args} tone="brand" />
      <Text {...args} tone="success" />
      <Text {...args} tone="warning" />
      <Text {...args} tone="danger" />
    </Stack>
  ),
}

export const Clamped: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Text clamp={2}>
        A design system is a shared language between design and engineering. It is not a component
        library alone — it is the tokens, the conventions and the documentation that keep hundreds
        of screens looking like one product.
      </Text>
    </div>
  ),
}

export const Monospace: Story = {
  render: () => <Text mono>npm install mayui</Text>,
}
