import type { Meta, StoryObj } from '@storybook/react'
import { Radio, RadioGroup } from './Radio'
import { Field } from '../Field/Field'

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  args: { 'aria-label': 'Billing period' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="monthly">
      <Radio value="monthly">Monthly</Radio>
      <Radio value="yearly">Yearly</Radio>
      <Radio value="lifetime">Lifetime</Radio>
    </RadioGroup>
  ),
}

export const WithDescriptions: Story = {
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <RadioGroup {...args} defaultValue="yearly">
        <Radio value="monthly" description="$12 per month, cancel any time.">Monthly</Radio>
        <Radio value="yearly" description="$120 per year — two months free.">Yearly</Radio>
        <Radio value="lifetime" description="One payment of $480." disabled>Lifetime</Radio>
      </RadioGroup>
    </div>
  ),
}

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup {...args} orientation="horizontal" defaultValue="md">
      <Radio value="sm">Small</Radio>
      <Radio value="md">Medium</Radio>
      <Radio value="lg">Large</Radio>
    </RadioGroup>
  ),
}

export const InAField: Story = {
  render: (args) => (
    <Field label="Billing period" description="Change this at any time from settings.">
      <RadioGroup {...args} defaultValue="monthly">
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </RadioGroup>
    </Field>
  ),
}
