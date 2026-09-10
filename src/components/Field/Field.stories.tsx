import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Field } from './Field'
import { Input } from '../Input/Input'
import { Textarea } from '../Textarea/Textarea'

const meta = {
  title: 'Catalog/Adaptive/Field',
  component: Field,
  args: {
    label: 'Apple ID',
    description: 'This is the email you use to sign in on all your devices.',
    children: <Input type="email" placeholder="name@icloud.com" />,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--may-space-5)',
      maxWidth: 420,
    }}
  >
    {children}
  </div>
)

/** The label points at the control, and the description is announced with it — none of which the consumer wires by hand. */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Field {...args} />
    </div>
  ),
}

/**
 * `error` is the only way to mark a control invalid. Setting it flips
 * `aria-invalid` on the input, swaps the description for the message and
 * re-points `aria-describedby`, so what is shown and what is announced cannot
 * drift apart.
 */
export const WithError: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Field {...args} error="That Apple ID isn’t available. Try another." />
    </div>
  ),
}

export const RequiredAndDisabled: Story = {
  render: () => (
    <Column>
      <Field label="Full Name" required>
        <Input placeholder="Craig Federighi" />
      </Field>
      <Field
        label="Managed Apple ID"
        description="Set by your organisation."
        disabled
      >
        <Input defaultValue="c.federighi@company.com" />
      </Field>
    </Column>
  ),
}

/** A real form: the error only appears once the value is wrong, and only one line of small print shows at a time. */
export const SignInForm: Story = {
  render: () => {
    const [email, setEmail] = useState('craig@')
    const valid = /.+@.+\..+/.test(email)
    return (
      <Column>
        <Field
          label="Apple ID"
          required
          description="Used for iCloud, the App Store and Find My."
          error={valid ? undefined : 'Enter a complete email address.'}
        >
          <Input
            type="email"
            placeholder="name@icloud.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field label="Device Name" description="Shown to nearby devices in AirDrop.">
          <Input defaultValue="Craig’s MacBook Pro" />
        </Field>

        <Field label="Notes" description="Only you can see this.">
          <Textarea placeholder="Anything worth remembering about this device…" rows={3} />
        </Field>
      </Column>
    )
  },
}
