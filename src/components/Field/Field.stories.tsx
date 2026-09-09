import type { Meta, StoryObj } from '@storybook/react'
import { Field } from './Field'
import { Input } from '../Input/Input'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/Field',
  component: Field,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Anatomy: Story = {
  args: {
    label: 'Workspace name',
    description: 'Shown to everyone you invite.',
    children: <Input fullWidth placeholder="Acme Inc." />,
  },
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <Field {...args} />
    </div>
  ),
}

export const AllStates: Story = {
  args: { children: <Input fullWidth /> },
  render: () => (
    <Stack gap={5} style={{ maxWidth: 380 }}>
      <Field label="Plain">
        <Input fullWidth placeholder="No help text" />
      </Field>
      <Field label="Required" required description="This one cannot be left empty.">
        <Input fullWidth placeholder="Required" />
      </Field>
      <Field label="Invalid" error="That workspace name is already taken." required>
        <Input fullWidth defaultValue="acme" />
      </Field>
      <Field label="Disabled" disabled description="Contact support to change this.">
        <Input fullWidth defaultValue="acme-legacy" />
      </Field>
    </Stack>
  ),
}
