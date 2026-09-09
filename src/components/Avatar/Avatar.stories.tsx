import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarGroup } from './Avatar'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Data display/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={3} align="center">
      <Avatar {...args} size="xs" />
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
      <Avatar {...args} size="xl" />
    </Stack>
  ),
}

export const Fallbacks: Story = {
  render: () => (
    <Stack direction="horizontal" gap={3} align="center">
      <Avatar name="Grace Hopper" />
      <Avatar name="Katherine Johnson" shape="square" />
      <Avatar initials="AI" />
      <Avatar />
    </Stack>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Margaret Hamilton" />
    </AvatarGroup>
  ),
}
