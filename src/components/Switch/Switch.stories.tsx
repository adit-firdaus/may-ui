import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { children: 'Enable two-factor authentication' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <Stack gap={3}>
      <Switch size="sm" defaultChecked>Small</Switch>
      <Switch size="md" defaultChecked>Medium</Switch>
      <Switch size="lg" defaultChecked>Large</Switch>
    </Stack>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Switch description="Require a one-time code in addition to your password." defaultChecked>
        Two-factor authentication
      </Switch>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={3}>
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled</Switch>
      <Switch disabled defaultChecked>Disabled and on</Switch>
    </Stack>
  ),
}
