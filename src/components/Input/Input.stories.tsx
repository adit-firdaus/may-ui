import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { Field } from '../Field/Field'
import { Stack } from '../Stack/Stack'

const SearchIcon = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const meta = {
  title: 'Forms/Input',
  component: Input,
  args: { placeholder: 'jane@example.com', fullWidth: true },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Input {...args} />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Input {...args} size="sm" placeholder="Small" />
      <Input {...args} size="md" placeholder="Medium" />
      <Input {...args} size="lg" placeholder="Large" />
    </Stack>
  ),
}

export const WithAffixes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Input {...args} prefix={SearchIcon} placeholder="Search projects" />
      <Input {...args} suffix={<span>USD</span>} placeholder="0.00" />
    </Stack>
  ),
}

export const InAField: Story = {
  render: (args) => (
    <Stack gap={5} style={{ maxWidth: 360 }}>
      <Field label="Email address" description="We only use this for billing receipts." required>
        <Input {...args} type="email" />
      </Field>
      <Field label="Email address" error="Enter a valid email address." required>
        <Input {...args} type="email" defaultValue="not-an-email" />
      </Field>
      <Field label="Email address" disabled>
        <Input {...args} defaultValue="locked@example.com" />
      </Field>
    </Stack>
  ),
}
