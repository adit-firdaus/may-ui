import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'
import { Field } from '../Field/Field'

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: { placeholder: 'Tell us what happened…', fullWidth: true },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Textarea {...args} />
    </div>
  ),
}

export const InAField: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Description" description="Markdown is supported.">
        <Textarea {...args} />
      </Field>
    </div>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Description" error="Description must be at least 20 characters.">
        <Textarea {...args} defaultValue="Too short" />
      </Field>
    </div>
  ),
}
