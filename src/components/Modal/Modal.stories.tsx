import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '../Button/Button'
import { Field } from '../Field/Field'
import { Input } from '../Input/Input'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  args: { open: false, onClose: () => {} },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Invite a teammate</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Invite a teammate"
          description="They will get an email with a link to join this workspace."
          footer={
            <>
              <Button variant="ghost" tone="neutral" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Send invite</Button>
            </>
          }
        >
          <Stack gap={4}>
            <Field label="Email address" required>
              <Input fullWidth type="email" placeholder="teammate@example.com" />
            </Field>
            <Field label="Message" description="Optional — included in the invitation email.">
              <Input fullWidth placeholder="Come help us ship the new dashboard" />
            </Field>
          </Stack>
        </Modal>
      </>
    )
  },
}

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button tone="danger" onClick={() => setOpen(true)}>Delete project</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          title="Delete this project?"
          footer={
            <>
              <Button variant="ghost" tone="neutral" onClick={() => setOpen(false)}>Cancel</Button>
              <Button tone="danger" onClick={() => setOpen(false)}>Delete forever</Button>
            </>
          }
        >
          <Text tone="muted">
            This removes the project, its deployments and all of its logs. This cannot be undone.
          </Text>
        </Modal>
      </>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null)
    return (
      <>
        <Stack direction="horizontal" gap={2}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <Button key={s} variant="outline" tone="neutral" onClick={() => setSize(s)}>{s}</Button>
          ))}
        </Stack>
        <Modal
          open={size !== null}
          onClose={() => setSize(null)}
          size={size ?? 'md'}
          title={`Size "${size}"`}
          footer={<Button onClick={() => setSize(null)}>Close</Button>}
        >
          <Text tone="muted">Each size caps the dialog width; the height always fits the viewport.</Text>
        </Modal>
      </>
    )
  },
}
