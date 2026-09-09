import type { Meta, StoryObj } from '@storybook/react'
import { Toast, ToastProvider, useToast } from './Toast'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  args: { title: 'Saved', description: 'Your changes are live.' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

/** Static toasts, so every tone is visible at once. */
export const Tones: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 420 }}>
      <Toast title="Saved" description="Your changes are live." tone="success" onDismiss={() => {}} />
      <Toast title="Heads up" description="A new version is available." tone="info" onDismiss={() => {}} />
      <Toast title="Approaching limit" description="92% of your quota is used." tone="warning" onDismiss={() => {}} />
      <Toast title="Upload failed" description="The file exceeded 25 MB." tone="danger" onDismiss={() => {}} />
      <Toast title="Draft saved" tone="neutral" onDismiss={() => {}} />
    </Stack>
  ),
}

export const WithAction: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Toast
        title="Message archived"
        description="Moved to the archive folder."
        action={{ label: 'Undo', onClick: () => {} }}
        onDismiss={() => {}}
      />
    </div>
  ),
}

function Demo() {
  const { toast, dismissAll } = useToast()
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button onClick={() => toast({ title: 'Saved', description: 'Your workspace is up to date.', tone: 'success' })}>
        Success
      </Button>
      <Button variant="outline" tone="neutral" onClick={() => toast({ title: 'Build failed', description: 'Three tests failed.', tone: 'danger', duration: 0 })}>
        Sticky error
      </Button>
      <Button variant="outline" tone="neutral" onClick={() => toast({ title: 'Message archived', action: { label: 'Undo', onClick: () => {} } })}>
        With action
      </Button>
      <Button variant="ghost" tone="neutral" onClick={dismissAll}>Dismiss all</Button>
    </Stack>
  )
}

/** The real queue: `useToast()` inside a `<ToastProvider>`. */
export const Live: Story = {
  render: () => (
    <ToastProvider position="bottom-right">
      <Demo />
    </ToastProvider>
  ),
}
