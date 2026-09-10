import type { Meta, StoryObj } from '@storybook/react'
import { Box } from './Box'

const meta = {
  title: 'Catalog/Adaptive/Box',
  component: Box,
  args: { padding: 4, surface: 'base', radius: 'card', children: 'Box' },
  argTypes: {
    surface: { control: 'inline-radio', options: ['none', 'base', 'nested', 'grouped'] },
    radius: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'card', 'sheet', 'full'] },
    shadow: { control: 'select', options: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The three layers iOS actually uses: the grouped page, the card that floats on
 * it, and the inset field inside the card. Nothing is separated by a stroke.
 */
export const Surfaces: Story = {
  render: () => (
    <Box surface="grouped" padding={4} radius="card">
      <Box surface="base" padding={4} radius="card">
        <div style={{ fontSize: 'var(--may-text-headline)', fontWeight: 600 }}>Apple ID</div>
        <div
          style={{
            fontSize: 'var(--may-text-footnote)',
            color: 'var(--may-color-text-secondary)',
            marginTop: 'var(--may-space-1)',
          }}
        >
          iCloud, Media &amp; Purchases
        </div>
        <Box
          surface="nested"
          padding={3}
          radius="md"
          style={{ marginTop: 'var(--may-space-3)', color: 'var(--may-color-text-secondary)' }}
        >
          appleid@icloud.com
        </Box>
      </Box>
    </Box>
  ),
}

/** Elevation is for layers that genuinely float; a card on the page needs none. */
export const Elevation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-4)', flexWrap: 'wrap' }}>
      {(['none', 'xs', 'md', 'lg', 'xl'] as const).map((s) => (
        <Box key={s} surface="base" padding={4} radius="card" shadow={s} style={{ minWidth: 96 }}>
          {s}
        </Box>
      ))}
    </div>
  ),
}

/** `as` keeps the semantics right — a Box that navigates is a real anchor. */
export const Polymorphic: Story = {
  render: () => (
    <Box
      as="a"
      href="#box"
      surface="base"
      padding={4}
      radius="card"
      style={{ display: 'block', color: 'var(--may-color-tint)', textDecoration: 'none' }}
    >
      Continue to Storage &amp; iCloud Usage
    </Box>
  ),
}
