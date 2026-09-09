import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4} align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Stack>
  ),
}

export const OnBrand: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4} align="center" style={{ color: 'var(--may-color-brand)' }}>
      <Spinner size="lg" />
    </Stack>
  ),
}
