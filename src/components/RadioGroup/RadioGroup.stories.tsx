import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { RadioGroup, Radio } from './RadioGroup'
import { Field } from '../Field'

const meta = {
  title: 'Catalog/Adaptive/RadioGroup',
  component: RadioGroup,
  args: { 'aria-label': 'AirDrop' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

/** The dot scales in with a little overshoot rather than simply appearing. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('contacts')
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <Radio value="off">Receiving Off</Radio>
        <Radio value="contacts">Contacts Only</Radio>
        <Radio value="everyone">Everyone for 10 Minutes</Radio>
      </RadioGroup>
    )
  },
}

/** A description turns each choice into a row you can actually decide from. */
export const WithDescriptions: Story = {
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <RadioGroup {...args} aria-label="Ask to join networks" defaultValue="notify">
        <Radio value="off" description="Known networks are joined automatically.">
          Off
        </Radio>
        <Radio value="notify" description="You are told when a network is available.">
          Notify
        </Radio>
        <Radio value="ask" description="Nothing is joined without your say-so.">
          Ask
        </Radio>
      </RadioGroup>
    </div>
  ),
}

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Appearance" orientation="horizontal" defaultValue="auto">
      <Radio value="light">Light</Radio>
      <Radio value="dark">Dark</Radio>
      <Radio value="auto">Automatic</Radio>
    </RadioGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <RadioGroup
          key={size}
          aria-label={`Ringtone, ${size}`}
          size={size}
          orientation="horizontal"
          defaultValue="reflection"
        >
          <Radio value="reflection">Reflection</Radio>
          <Radio value="opening">Opening</Radio>
          <Radio value="chimes">Chimes</Radio>
        </RadioGroup>
      ))}
    </div>
  ),
}

/**
 * A disabled group greys out wholesale and a single choice can opt out alone.
 * Inside a `Field`, `error` marks the whole group invalid — a wash of the
 * destructive tone on every ring, and `aria-describedby` pointing at the
 * message. The group keeps its own `aria-label`: a `<label for>` cannot name a
 * `role="radiogroup"`.
 */
export const StatesAndValidation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)', maxWidth: 440 }}>
      <RadioGroup aria-label="Managed backup" defaultValue="daily" disabled>
        <Radio value="daily">Back Up Daily</Radio>
        <Radio value="weekly">Back Up Weekly</Radio>
      </RadioGroup>

      <RadioGroup aria-label="Storage plan" defaultValue="50gb">
        <Radio value="5gb">5 GB — Free</Radio>
        <Radio value="50gb">50 GB</Radio>
        <Radio value="2tb" disabled description="Not available in your region.">
          2 TB
        </Radio>
      </RadioGroup>

      <Field label="Delivery" error="Pick where new mail should arrive.">
        <RadioGroup aria-label="Delivery">
          <Radio value="push">Push</Radio>
          <Radio value="fetch">Fetch</Radio>
          <Radio value="manual">Manual</Radio>
        </RadioGroup>
      </Field>
    </div>
  ),
}
