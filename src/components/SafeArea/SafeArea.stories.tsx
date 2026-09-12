import type { Meta, StoryObj } from '@storybook/react'
import { SafeArea } from '.'

const meta = {
  title: 'Catalog/Adaptive/SafeArea',
  component: SafeArea,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SafeArea>

export default meta
type Story = StoryObj<typeof meta>

/**
 * On a desktop browser env() reports zero, so these render flush — which is
 * the honest preview. The padding appears on hardware that needs it, and on a
 * WebView shell that injects real values into --may-inset-*.
 */
const Phone = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      maxWidth: 360,
      background: 'var(--may-color-bg)',
      borderRadius: 'var(--may-radius-sheet)',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
)

/** As a wrapper: content is padded clear of the notch and the home indicator. */
export const Wrapper: Story = {
  render: () => (
    <Phone>
      <SafeArea>
        <div
          style={{
            background: 'var(--may-color-surface)',
            borderRadius: 'var(--may-radius-card)',
            margin: 'var(--may-space-4)',
            padding: 'var(--may-space-4)',
            fontSize: 'var(--may-text-body)',
          }}
        >
          Content that never runs under the hardware.
        </div>
      </SafeArea>
    </Phone>
  ),
}

/**
 * As a spacer: empty, it is exactly the height of the bottom inset — the strip
 * that keeps the last row of a scroll clear of the home indicator.
 */
export const BottomSpacer: Story = {
  render: () => (
    <Phone>
      <div style={{ padding: 'var(--may-space-4)', fontSize: 'var(--may-text-body)' }}>
        Recently Deleted
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: 'var(--may-space-2) 0',
          background: 'var(--may-color-surface)',
          color: 'var(--may-color-text-secondary)',
          fontSize: 'var(--may-text-caption-1)',
        }}
      >
        <span>Library</span>
        <span style={{ color: 'var(--may-color-tint)' }}>For You</span>
        <span>Albums</span>
      </div>
      <SafeArea edges="bottom" />
    </Phone>
  ),
}

/** Edges are opt-in: a landscape sidebar only needs the left inset. */
export const SingleEdge: Story = {
  args: { edges: ['left', 'right'] },
  render: (args) => (
    <Phone>
      <SafeArea {...args}>
        <div
          style={{
            padding: 'var(--may-space-4)',
            background: 'var(--may-color-surface)',
            fontSize: 'var(--may-text-subheadline)',
          }}
        >
          Horizontal insets only — the notch corners in landscape.
        </div>
      </SafeArea>
    </Phone>
  ),
}
