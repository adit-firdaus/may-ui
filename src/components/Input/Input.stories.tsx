import type { Meta, StoryObj } from '@storybook/react'
import { IoPerson } from 'react-icons/io5'
import { Input } from '.'
import { Field } from '../Field'

const meta = {
  title: 'Catalog/Adaptive/Input',
  component: Input,
  args: { placeholder: 'name@icloud.com' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: 420 }}>
    {children}
  </div>
)

/** A fill, not a box. Focus is a sprung ring drawn with box-shadow — there is no stroke anywhere in the control. */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Input {...args} fullWidth />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Column>
      <Input {...args} size="sm" fullWidth placeholder="Small — 36pt" />
      <Input {...args} size="md" fullWidth placeholder="Medium — 44pt" />
      <Input {...args} size="lg" fullWidth placeholder="Large — 52pt" />
    </Column>
  ),
}

/** Affixes are part of the field: clicking a unit or the gutter focuses the control, the way a native text field's whole tap area does. */
export const PrefixAndSuffix: Story = {
  render: () => (
    <Column>
      <Input fullWidth prefix={<IoPerson aria-hidden />} placeholder="Search contacts" />
      <Input fullWidth prefix="$" suffix="USD" inputMode="decimal" placeholder="0.00" />
      <Input fullWidth suffix="@icloud.com" placeholder="craig" />
    </Column>
  ),
}

export const States: Story = {
  render: () => (
    <Column>
      <Input fullWidth defaultValue="Craig Federighi" />
      <Input fullWidth invalid defaultValue="craig@" />
      <Input fullWidth disabled defaultValue="Managed by your organisation" />
      <Input fullWidth readOnly defaultValue="AA:BB:CC:DD:EE:FF" />
    </Column>
  ),
}

/** Inside a `Field`, the id, `aria-describedby` and `aria-invalid` all arrive through context — and the control stretches to the Field's width without `fullWidth`. */
export const InAField: Story = {
  render: () => (
    <Column>
      <Field label="Wi-Fi Password" description="Must be at least 8 characters." required>
        <Input type="password" placeholder="Password" />
      </Field>
      <Field label="Static IP" error="Enter a valid IPv4 address.">
        <Input defaultValue="192.168.0" inputMode="numeric" />
      </Field>
    </Column>
  ),
}
