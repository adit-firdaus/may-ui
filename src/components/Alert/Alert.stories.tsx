import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './Alert'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  args: { title: 'Deployment queued', children: 'Your changes will be live in about two minutes.' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Alert {...args} />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 520 }}>
      <Alert tone="info" title="Heads up">A new version of the CLI is available.</Alert>
      <Alert tone="success" title="Saved">Your workspace settings have been updated.</Alert>
      <Alert tone="warning" title="Approaching limit">You have used 92% of your monthly quota.</Alert>
      <Alert tone="danger" title="Build failed">Three tests failed on the last commit.</Alert>
      <Alert tone="neutral" title="Scheduled maintenance">Read-only mode on Sunday, 02:00–04:00 UTC.</Alert>
    </Stack>
  ),
}

export const WithActions: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Alert
        tone="warning"
        title="Your card is expiring"
        onDismiss={() => {}}
        actions={
          <>
            <Button size="sm" tone="warning">Update card</Button>
            <Button size="sm" variant="ghost" tone="neutral">Remind me later</Button>
          </>
        }
      >
        The card ending in 4242 expires at the end of this month.
      </Alert>
    </div>
  ),
}

export const Outline: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Alert variant="outline" tone="info" title="Outline variant">
        Use this on tinted backgrounds where a soft fill would disappear.
      </Alert>
    </div>
  ),
}
