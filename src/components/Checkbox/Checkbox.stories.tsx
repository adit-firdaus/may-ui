import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { children: 'Email me about product updates' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <Stack gap={3}>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>Disabled and checked</Checkbox>
    </Stack>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Checkbox description="Receive a digest every Monday morning." defaultChecked>
        Weekly summary
      </Checkbox>
      <Checkbox description="Immediate alerts when a build fails.">Build failures</Checkbox>
    </Stack>
  ),
}
