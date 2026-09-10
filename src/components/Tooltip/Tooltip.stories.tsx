import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

const ReplyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M8 5L3.5 9.5 8 14M4 9.5h7.5a5 5 0 0 1 5 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const FlagIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M5 17V4.2c3-1.6 6-.4 9 0v7.6c-3-1.4-6-2.6-9 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
)

const ArchiveIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <path
      d="M3 6.5h14M4.5 6.5V15a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5M3.5 3.5h13v3h-13zM8 10h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta = {
  title: 'Catalog/Adaptive/Tooltip',
  component: Tooltip,
  args: {
    label: 'Reply',
    children: (
      <IconButton aria-label="Reply" variant="gray">
        <ReplyIcon />
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
          <ReplyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip label="Flag">
        <IconButton aria-label="Flag">
          <FlagIcon />
        </IconButton>
      </Tooltip>
      <Tooltip label="Archive">
        <IconButton aria-label="Archive">
          <ArchiveIcon />
        </IconButton>
      </Tooltip>
      <Tooltip label="Move to Junk — this sender will be blocked">
        <IconButton aria-label="Move to Junk" tone="danger">
          <ArchiveIcon />
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
