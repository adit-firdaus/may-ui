import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from './IconButton'

const meta = {
  title: 'Catalog/Adaptive/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Share', children: <ShareIcon /> },
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tinted', 'gray', 'plain'] },
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

export const Default: Story = {}

/** The same four variants as Button — IconButton consumes Button's own rules. */
export const Variants: Story = {
  render: (args) => (
    <Row>
      <IconButton {...args} variant="filled" />
      <IconButton {...args} variant="tinted" />
      <IconButton {...args} variant="gray" />
      <IconButton {...args} variant="plain" />
    </Row>
  ),
}

/** `round` is what a close or overflow button wants; the default square suits a toolbar. */
export const Round: Story = {
  render: () => (
    <Row>
      <IconButton aria-label="Close" round variant="gray" tone="neutral">
        <CloseIcon />
      </IconButton>
      <IconButton aria-label="More" round variant="gray" tone="neutral">
        <EllipsisIcon />
      </IconButton>
      <IconButton aria-label="Add contact" round variant="filled">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Delete message" round variant="tinted" tone="danger">
        <TrashIcon />
      </IconButton>
    </Row>
  ),
}

/** xs and sm sit under 44px, so both keep a full-size invisible hit area. */
export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <IconButton {...args} key={s} size={s} variant="gray" tone="neutral" />
      ))}
    </Row>
  ),
}

/** A Mail message toolbar: plain glyphs, tint-coloured, spread across the bar. */
export const MailActions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 380,
        padding: 'var(--may-space-2)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
      }}
    >
      <IconButton aria-label="Move to folder">
        <FolderIcon />
      </IconButton>
      <IconButton aria-label="Delete message" tone="danger">
        <TrashIcon />
      </IconButton>
      <IconButton aria-label="Reply">
        <ReplyIcon />
      </IconButton>
      <IconButton aria-label="New message">
        <ComposeIcon />
      </IconButton>
      <IconButton aria-label="Sending" loading />
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <Row>
      <IconButton {...args} variant="gray" tone="neutral" />
      <IconButton {...args} variant="gray" tone="neutral" loading />
      <IconButton {...args} variant="gray" tone="neutral" disabled />
    </Row>
  ),
}

/* ------------------------------- glyphs ---------------------------------- */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5" {...stroke} />
      <path d="M4.5 11v5.5h11V11" {...stroke} />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M6 6l8 8M14 6l-8 8" {...stroke} strokeWidth={1.9} />
    </svg>
  )
}

function EllipsisIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <circle cx="5" cy="10" r="1.4" fill="currentColor" />
      <circle cx="10" cy="10" r="1.4" fill="currentColor" />
      <circle cx="15" cy="10" r="1.4" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" {...stroke} strokeWidth={1.9} />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 10h6.4L14 6" {...stroke} />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M3 6.5A1.5 1.5 0 014.5 5h3l1.5 2h6.5A1.5 1.5 0 0117 8.5v6A1.5 1.5 0 0115.5 16h-11A1.5 1.5 0 013 14.5z" {...stroke} />
    </svg>
  )
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M8 5L3.5 9.5 8 14" {...stroke} />
      <path d="M3.5 9.5H12a4.5 4.5 0 014.5 4.5v1" {...stroke} />
    </svg>
  )
}

function ComposeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M16.5 5.5l-2-2-8 8-.8 2.8 2.8-.8z" {...stroke} />
      <path d="M4 16.5h12" {...stroke} />
    </svg>
  )
}
