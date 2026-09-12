import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '.'

const meta = {
  title: 'Catalog/Adaptive/Separator',
  component: Separator,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--may-space-3) var(--may-space-4)', fontSize: 'var(--may-text-body)' }}>
    {children}
  </div>
)

/**
 * Inside a card: one hairline between rows, drawn as background rather than a
 * border, so it is a true half pixel on a retina screen.
 */
export const InACard: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        overflow: 'hidden',
      }}
    >
      <Row>Do Not Disturb</Row>
      <Separator />
      <Row>Scheduled Summary</Row>
      <Separator />
      <Row>Allow Notifications</Row>
    </div>
  ),
}

/** Vertical rules divide a toolbar's action groups. They stretch to the row. */
export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 'var(--may-space-4)',
        maxWidth: 420,
        padding: 'var(--may-space-3) var(--may-space-4)',
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        color: 'var(--may-color-tint)',
        fontSize: 'var(--may-text-subheadline)',
      }}
    >
      <span>Reply</span>
      <Separator orientation="vertical" />
      <span>Forward</span>
      <Separator orientation="vertical" />
      <span>Archive</span>
    </div>
  ),
}

/** The sign-in divider: a caption with the rule running out to either side. */
export const Labelled: Story = {
  args: { label: 'or' },
  render: (args) => (
    <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--may-space-3)',
          borderRadius: 'var(--may-radius-lg)',
          background: 'var(--may-color-primary)',
          color: 'var(--may-color-on-primary)',
          fontSize: 'var(--may-text-body)',
          fontWeight: 600,
        }}
      >
        Sign in with Apple
      </div>
      <Separator {...args} />
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--may-space-3)',
          borderRadius: 'var(--may-radius-lg)',
          background: 'var(--may-color-fill-tertiary)',
          color: 'var(--may-color-tint)',
          fontSize: 'var(--may-text-body)',
        }}
      >
        Use a Password
      </div>
    </div>
  ),
}

/** Between whole sections, where the hairline replaces vertical whitespace. */
export const BetweenSections: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <div
        style={{
          fontSize: 'var(--may-text-title-3)',
          fontWeight: 'var(--may-text-title-3-weight)',
          letterSpacing: 'var(--may-text-title-3-tracking)',
          marginBottom: 'var(--may-space-3)',
        }}
      >
        iPhone Storage
      </div>
      <Separator />
      <div
        style={{
          fontSize: 'var(--may-text-footnote)',
          color: 'var(--may-color-text-secondary)',
          marginTop: 'var(--may-space-3)',
        }}
      >
        128 GB of 256 GB used
      </div>
    </div>
  ),
}
