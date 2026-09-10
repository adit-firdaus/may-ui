import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Textarea } from './Textarea'
import { Field } from '../Field/Field'

const meta = {
  title: 'Catalog/Adaptive/Textarea',
  component: Textarea,
  args: { placeholder: 'Add a note…', fullWidth: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    resize: { control: 'inline-radio', options: ['none', 'vertical', 'both'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: 440 }}>
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <Textarea {...args} />
    </div>
  ),
}

/** The Messages compose field: the draft is never hidden behind an internal scrollbar. `rows` stays the floor it will not shrink below. */
export const AutoGrow: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      'Landing at 6:40 — I’ll head straight to the studio.\nCan you start without me?',
    )
    return (
      <Column>
        <Textarea
          {...args}
          autoGrow
          rows={2}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="iMessage"
        />
        <span style={{ fontSize: 'var(--may-text-footnote)', color: 'var(--may-color-text-secondary)' }}>
          {value.length} characters
        </span>
      </Column>
    )
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Column>
      <Textarea {...args} size="sm" rows={2} placeholder="Small" />
      <Textarea {...args} size="md" rows={3} placeholder="Medium" />
      <Textarea {...args} size="lg" rows={4} placeholder="Large" />
    </Column>
  ),
}

export const States: Story = {
  render: (args) => (
    <Column>
      <Textarea {...args} resize="none" defaultValue="Fixed height — the drag handle is off." />
      <Textarea {...args} invalid defaultValue="Too short." />
      <Textarea {...args} disabled defaultValue="Set by a configuration profile." />
    </Column>
  ),
}

/** Wrapped in a `Field`, the error message replaces the description rather than stacking under it. */
export const InAField: Story = {
  render: () => (
    <Column>
      <Field
        label="Feedback"
        description="Shared with the developer along with your device model."
        required
      >
        <Textarea rows={4} placeholder="What happened?" fullWidth />
      </Field>
      <Field label="Away Message" error="An away message can be at most 120 characters.">
        <Textarea
          rows={3}
          fullWidth
          defaultValue="I’m away from my desk until Monday and will reply to everything then — thanks for your patience, and sorry for the delay."
        />
      </Field>
    </Column>
  ),
}
