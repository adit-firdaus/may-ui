import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

const meta = {
  title: 'Catalog/Adaptive/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    attached: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The seam between attached buttons is a hairline **gap**, not a stroke — the
 * card behind the cluster shows through it. Press one and the whole cluster
 * takes the press, so the seams never tear open.
 */
export const Attached: Story = {
  render: (args) => (
    <div
      style={{
        display: 'inline-block',
        padding: 'var(--may-space-5)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
      }}
    >
      <ButtonGroup {...args} aria-label="Text actions">
        <Button variant="gray" tone="neutral">Cut</Button>
        <Button variant="gray" tone="neutral">Copy</Button>
        <Button variant="gray" tone="neutral">Paste</Button>
      </ButtonGroup>
    </div>
  ),
}

/** Detached is just a row with a gap — for actions that are not one decision. */
export const Detached: Story = {
  args: { attached: false },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="gray" tone="neutral">Cancel</Button>
      <Button>Send</Button>
    </ButtonGroup>
  ),
}

/** An alert's actions: two equal halves, split by the sheet showing through. */
export const AlertActions: Story = {
  render: () => (
    <div
      style={{
        width: 280,
        padding: 'var(--may-space-5)',
        borderRadius: 'var(--may-radius-sheet)',
        background: 'var(--may-color-surface)',
        boxShadow: 'var(--may-shadow-lg)',
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--may-text-headline)', fontWeight: 'var(--may-text-headline-weight)' }}>
        Delete “Trip to Kyoto”?
      </p>
      <p
        style={{
          margin: 'var(--may-space-1) 0 var(--may-space-5)',
          fontSize: 'var(--may-text-subheadline)',
          color: 'var(--may-color-text-secondary)',
        }}
      >
        This album and its 128 photos will be removed from all your devices.
      </p>
      <ButtonGroup fullWidth aria-label="Confirm deletion">
        <Button variant="gray" tone="neutral">Cancel</Button>
        <Button variant="tinted" tone="danger">Delete</Button>
      </ButtonGroup>
    </div>
  ),
}

/** Vertical is the iOS action-sheet stack: one column, one shared radius. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ButtonGroup {...args} fullWidth style={{ maxWidth: 280 }} aria-label="Photo actions">
      <Button variant="gray" tone="neutral" size="lg">Save to Photos</Button>
      <Button variant="gray" tone="neutral" size="lg">Add to Shared Album</Button>
      <Button variant="gray" tone="neutral" size="lg">Duplicate</Button>
      <Button variant="gray" tone="danger" size="lg">Delete Photo</Button>
    </ButtonGroup>
  ),
}

/** IconButtons cluster too — their expanded hit area stands down inside a group. */
export const Icons: Story = {
  render: (args) => (
    <ButtonGroup {...args} aria-label="Text style">
      <IconButton aria-label="Bold" variant="gray" tone="neutral">
        <span style={{ fontWeight: 700 }}>B</span>
      </IconButton>
      <IconButton aria-label="Italic" variant="gray" tone="neutral">
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--may-font-sans)' }}>I</span>
      </IconButton>
      <IconButton aria-label="Underline" variant="gray" tone="neutral">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </IconButton>
    </ButtonGroup>
  ),
}
