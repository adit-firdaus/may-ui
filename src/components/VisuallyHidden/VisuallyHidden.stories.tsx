import type { Meta, StoryObj } from '@storybook/react'
import { IoCheckmark, IoCreateOutline } from 'react-icons/io5'
import { VisuallyHidden } from '.'

const meta = {
  title: 'Catalog/Adaptive/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Announced, never drawn' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

const iconButton: React.CSSProperties = {
  width: 'var(--may-control-h)',
  height: 'var(--may-control-h)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  borderRadius: 'var(--may-radius-full)',
  background: 'var(--may-color-fill-tertiary)',
  color: 'var(--may-color-tint)',
  cursor: 'pointer',
}

/**
 * The main job: naming an icon-only control. A real label beats aria-label
 * because it is translated, selectable by voice control, and never silently
 * out of sync with the glyph.
 */
export const IconButtonLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-3)' }}>
      <button type="button" style={iconButton}>
        <IoCreateOutline aria-hidden style={{ width: 18, height: 18 }} />
        <VisuallyHidden>Compose message</VisuallyHidden>
      </button>
      <button type="button" style={iconButton}>
        <IoCheckmark aria-hidden style={{ width: 18, height: 18 }} />
        <VisuallyHidden>Mark as read</VisuallyHidden>
      </button>
    </div>
  ),
}

/**
 * `focusable` is required whenever the content can be tabbed to. Press Tab in
 * the preview: the skip link appears rather than moving focus somewhere blind.
 */
export const SkipLink: Story = {
  render: () => (
    <div>
      <VisuallyHidden focusable>
        <a href="#main" style={{ color: 'var(--may-color-tint)', fontSize: 'var(--may-text-subheadline)' }}>
          Skip to content
        </a>
      </VisuallyHidden>
      <div
        id="main"
        style={{
          marginTop: 'var(--may-space-4)',
          padding: 'var(--may-space-4)',
          background: 'var(--may-color-surface)',
          borderRadius: 'var(--may-radius-card)',
          fontSize: 'var(--may-text-body)',
        }}
      >
        Settings
      </div>
    </div>
  ),
}

/** Extra context for a value that reads as ambiguous on its own. */
export const ContextForAValue: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 320,
        display: 'flex',
        justifyContent: 'space-between',
        padding: 'var(--may-space-3) var(--may-space-4)',
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        fontSize: 'var(--may-text-body)',
      }}
    >
      <span>Battery</span>
      <span style={{ color: 'var(--may-color-text-secondary)' }}>
        82<VisuallyHidden> percent remaining</VisuallyHidden>%
      </span>
    </div>
  ),
}
