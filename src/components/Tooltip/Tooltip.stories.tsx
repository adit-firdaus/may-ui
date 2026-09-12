import type { Meta, StoryObj } from '@storybook/react'
import { IoArchiveOutline, IoArrowUndoOutline, IoFlagOutline } from 'react-icons/io5'
import { Tooltip } from '.'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

const meta = {
  title: 'Catalog/Adaptive/Tooltip',
  component: Tooltip,
  args: {
    label: 'Reply',
    children: (
      <IconButton aria-label="Reply" variant="gray">
        <IoArrowUndoOutline aria-hidden />
      </IconButton>
    ),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Rest the pointer on the control, or tab to it. On a touch device nothing
 * happens at all — a hint bound to tap has no dismissal gesture and covers the
 * control the tap was meant for, so the hover path is gated off entirely there
 * while the keyboard path stays open.
 *
 * The hint describes; it never names. The control keeps its own `aria-label`.
 */
export const Default: Story = {}

/** A Mail toolbar: every glyph carries its meaning one hover away. */
export const Toolbar: Story = {
  render: () => (
    <div
      data-slot="toolbar"
      style={{
        display: 'inline-flex',
        gap: 'var(--may-space-1)',
        padding: 'var(--may-space-2)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
      }}
    >
      <Tooltip label="Reply">
        <IconButton aria-label="Reply">
          <IoArrowUndoOutline aria-hidden />
        </IconButton>
      </Tooltip>
      <Tooltip label="Flag">
        <IconButton aria-label="Flag">
          <IoFlagOutline aria-hidden />
        </IconButton>
      </Tooltip>
      <Tooltip label="Archive">
        <IconButton aria-label="Archive">
          <IoArchiveOutline aria-hidden />
        </IconButton>
      </Tooltip>
      <Tooltip label="Move to Junk — this sender will be blocked">
        <IconButton aria-label="Move to Junk" tone="danger">
          <IoArchiveOutline aria-hidden />
        </IconButton>
      </Tooltip>
    </div>
  ),
}

/** A side, optionally aligned along it — and a flip when the edge is too close. */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-3)', padding: 'var(--may-space-12)' }}>
      <Tooltip label="Above" placement="top">
        <Button variant="gray">Top</Button>
      </Tooltip>
      <Tooltip label="Below" placement="bottom">
        <Button variant="gray">Bottom</Button>
      </Tooltip>
      <Tooltip label="To the left" placement="left">
        <Button variant="gray">Left</Button>
      </Tooltip>
      <Tooltip label="To the right" placement="right">
        <Button variant="gray">Right</Button>
      </Tooltip>
    </div>
  ),
}

/**
 * The delay is what separates a hint from a flicker: a pointer crossing a
 * toolbar on its way somewhere else should not leave a trail of labels. Keyboard
 * focus ignores it — that user asked for the hint directly.
 */
export const Delay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-3)' }}>
      <Tooltip label="Instant" delay={0}>
        <Button variant="gray">0 ms</Button>
      </Tooltip>
      <Tooltip label="Default — 500 ms">
        <Button variant="gray">500 ms</Button>
      </Tooltip>
      <Tooltip label="Deliberate" delay={1200}>
        <Button variant="gray">1200 ms</Button>
      </Tooltip>
      <Tooltip label="Never shown" disabled>
        <Button variant="gray">Disabled</Button>
      </Tooltip>
    </div>
  ),
}
