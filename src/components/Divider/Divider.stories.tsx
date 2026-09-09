import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './Divider'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Text>Above the rule</Text>
      <Divider />
      <Text>Below the rule</Text>
    </Stack>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Text>Sign in with your password</Text>
      <Divider>or</Divider>
      <Text>Continue with a magic link</Text>
    </Stack>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4} align="center">
      <Text>Drafts</Text>
      <Divider orientation="vertical" />
      <Text>Published</Text>
      <Divider orientation="vertical" />
      <Text>Archived</Text>
    </Stack>
  ),
}
