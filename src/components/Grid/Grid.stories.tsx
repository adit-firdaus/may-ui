import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from '.'

const meta = {
  title: 'Catalog/Adaptive/Grid',
  component: Grid,
  args: { columns: 4, gap: 4 },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

const APPS = [
  ['Messages', 'green'],
  ['Photos', 'spectrum'],
  ['Maps', 'teal'],
  ['Music', 'pink'],
  ['Notes', 'yellow'],
  ['Podcasts', 'purple'],
  ['Wallet', 'gray'],
  ['App Store', 'blue'],
] as const

function AppIcon({ name, gradient }: { name: string; gradient: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--may-space-2)' }}>
      <span
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 'var(--may-radius-squircle)',
          background: `var(--may-grad-${gradient})`,
          boxShadow: 'var(--may-shadow-sm)',
        }}
      />
      <span
        style={{
          fontSize: 'var(--may-text-caption-1)',
          color: 'var(--may-color-text-secondary)',
          textAlign: 'center',
        }}
      >
        {name}
      </span>
    </div>
  )
}

/** The Home screen shape: a fixed column count, icons that scale to fit it. */
export const HomeScreen: Story = {
  render: (args) => (
    <Grid {...args} style={{ maxWidth: 380 }}>
      {APPS.map(([name, gradient]) => (
        <AppIcon key={name} name={name} gradient={gradient} />
      ))}
    </Grid>
  ),
}

/**
 * `minColumnWidth` drops a column when the container narrows — no media query,
 * no resize listener. Drag the preview edge to watch it reflow.
 */
export const AutoFill: Story = {
  render: () => (
    <Grid minColumnWidth={140} gap={3}>
      {['Recents', 'Favourites', 'Shared', 'Hidden', 'Recently Deleted', 'Screenshots'].map((album) => (
        <div
          key={album}
          style={{
            background: 'var(--may-color-surface)',
            borderRadius: 'var(--may-radius-card)',
            padding: 'var(--may-space-4)',
          }}
        >
          <div style={{ fontSize: 'var(--may-text-subheadline)', fontWeight: 600 }}>{album}</div>
          <div style={{ fontSize: 'var(--may-text-caption-1)', color: 'var(--may-color-text-secondary)' }}>
            {12 + album.length * 7} items
          </div>
        </div>
      ))}
    </Grid>
  ),
}

/** Column counts, with the same gap, so the rhythm stays constant. */
export const ColumnCounts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {[2, 3, 5].map((columns) => (
        <Grid key={columns} columns={columns} gap={3}>
          {Array.from({ length: columns }, (_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--may-color-fill-tertiary)',
                borderRadius: 'var(--may-radius-md)',
                padding: 'var(--may-space-4)',
                textAlign: 'center',
                fontSize: 'var(--may-text-footnote)',
              }}
            >
              {columns} up
            </div>
          ))}
        </Grid>
      ))}
    </div>
  ),
}

/** A photo wall: square tiles, tight gap, nothing separated by a stroke. */
export const PhotoWall: Story = {
  render: () => (
    <Grid minColumnWidth={96} gap={1}>
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          style={{
            aspectRatio: '1',
            borderRadius: 'var(--may-radius-xs)',
            background: `var(--may-grad-${['blue', 'green', 'orange', 'pink', 'purple', 'teal'][i % 6]})`,
            opacity: 0.9,
          }}
        />
      ))}
    </Grid>
  ),
}
