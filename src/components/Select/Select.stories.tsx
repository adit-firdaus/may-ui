import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'
import { Field } from '../Field/Field'
import { Stack } from '../Stack/Stack'

const options = [
  { label: 'Draft', value: 'draft' },
  { label: 'In review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived', disabled: true },
]

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { options, fullWidth: true, placeholder: 'Choose a status' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Select {...args} />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <Select {...args} size="sm" />
      <Select {...args} size="md" />
      <Select {...args} size="lg" />
    </Stack>
  ),
}

export const InAField: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Field label="Status" description="Only published pages are publicly visible.">
        <Select {...args} defaultValue="review" placeholder={undefined} />
      </Field>
    </div>
  ),
}
