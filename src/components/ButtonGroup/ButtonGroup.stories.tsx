import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Actions/ButtonGroup',
  component: ButtonGroup,
  args: { 'aria-label': 'Text alignment' },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Attached: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" tone="neutral">Left</Button>
      <Button variant="outline" tone="neutral">Center</Button>
      <Button variant="outline" tone="neutral">Right</Button>
    </ButtonGroup>
  ),
}

export const Spaced: Story = {
  render: (args) => (
    <ButtonGroup {...args} attached={false}>
      <Button variant="outline" tone="neutral">Cancel</Button>
      <Button>Confirm</Button>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap={6}>
      <ButtonGroup {...args} orientation="vertical">
        <Button variant="outline" tone="neutral">Top</Button>
        <Button variant="outline" tone="neutral">Middle</Button>
        <Button variant="outline" tone="neutral">Bottom</Button>
      </ButtonGroup>
    </Stack>
  ),
}
