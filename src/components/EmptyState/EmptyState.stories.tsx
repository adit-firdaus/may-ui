import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'
import { Card } from '../Card'

const meta = {
  title: 'Catalog/Adaptive/EmptyState',
  component: EmptyState,
  args: { title: 'No Mail' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An empty state is not an error, so nothing here is saturated except the
 * action. The three parts arrive staggered, top-down.
 */
export const Default: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      glyph={<MailIcon />}
      title="No Mail"
      description="You have read everything in this mailbox. New messages will appear here."
    />
  ),
}

/** With an action — the one element allowed to carry colour. */
export const WithAction: Story = {
  render: () => (
    <EmptyState
      glyph={<AirDropIcon />}
      title="No People Nearby"
      description="AirDrop finds people who have their iPhone or Mac unlocked and nearby."
      action={
        <>
          <Button variant="gray">Learn More</Button>
          <Button>Turn On Bluetooth</Button>
        </>
      }
    />
  ),
}

/** Three sizes: a card slot, a screen, and a whole window. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Card key={size} variant="grouped" padding="none">
          <EmptyState
            size={size}
            glyph={<SearchIcon />}
            title="No Results"
            description={`Nothing matched “tokyo” in this mailbox. (size: ${size})`}
          />
        </Card>
      ))}
    </div>
  ),
}

/** Dropped into a card as the placeholder for a list that has no rows yet. */
export const InACard: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Card padding="none">
        <EmptyState
          size="sm"
          glyph={<DownloadIcon />}
          title="No Downloads"
          description="Files you download will appear here."
          action={<Button size="sm" variant="tinted">Browse Files</Button>}
        />
      </Card>
    </div>
  ),
}

/* --- glyphs: plain strokes, sized by the slot rather than by themselves --- */

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 7.5l8.5 6 8.5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AirDropIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 13.5a5 5 0 018 0M9.75 16.5a2.75 2.75 0 014.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4v11m0 0l-4-4m4 4l4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 17.5v1a2 2 0 002 2h11a2 2 0 002-2v-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
