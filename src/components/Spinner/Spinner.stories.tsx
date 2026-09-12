import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from '.'

const meta = {
  title: 'Catalog/Adaptive/Spinner',
  component: Spinner,
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    spokes: { control: { type: 'range', min: 6, max: 16, step: 1 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: 'var(--may-space-5)',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}
  >
    {children}
  </div>
)

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <Row>
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <Spinner key={s} size={s} />
      ))}
    </Row>
  ),
}

export const Tones: Story = {
  render: () => (
    <Row>
      {(['neutral', 'tint', 'success', 'warning', 'danger'] as const).map((t) => (
        <Spinner key={t} tone={t} size="lg" />
      ))}
    </Row>
  ),
}

/** Eight spokes is UIKit's count; twelve reads smoother once the ring is large. */
export const SpokeCount: Story = {
  render: () => (
    <Row>
      {[6, 8, 12, 16].map((n) => (
        <div key={n} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--may-space-2)' }}>
          <Spinner size="lg" spokes={n} />
          <span
            style={{
              fontSize: 'var(--may-text-caption-1)',
              color: 'var(--may-color-text-secondary)',
            }}
          >
            {n}
          </span>
        </div>
      ))}
    </Row>
  ),
}

/** How it actually gets used: mid-list, while a fetch is in flight. */
export const InContext: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--may-space-3)',
          minHeight: 'var(--may-control-h)',
          padding: 'var(--may-space-3) var(--may-space-4)',
        }}
      >
        <Spinner size="sm" label="Fetching mail" />
        <span style={{ color: 'var(--may-color-text-secondary)' }}>Checking for Mail…</span>
      </div>
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: 'var(--may-space-3)',
          padding: 'var(--may-space-10) var(--may-space-4)',
        }}
      >
        <Spinner size="lg" spokes={12} />
        <span
          style={{
            fontSize: 'var(--may-text-subheadline)',
            color: 'var(--may-color-text-secondary)',
          }}
        >
          Signing in to iCloud
        </span>
      </div>
    </div>
  ),
}
