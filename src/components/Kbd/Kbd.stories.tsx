import type { Meta, StoryObj } from '@storybook/react'
import { Kbd } from './Kbd'
import { Text } from '../Text/Text'

const meta = {
  title: 'Catalog/Adaptive/Kbd',
  component: Kbd,
  args: { children: 'K' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

/** Caps sit inline, so a shortcut is just a run of them. */
function Combo({ keys, size }: { keys: string[]; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 'var(--may-space-1)', alignItems: 'center' }}>
      {keys.map((key) => (
        <Kbd key={key} size={size}>
          {key}
        </Kbd>
      ))}
    </span>
  )
}

/** A menu row: title on the left, shortcut trailing — the macOS menu shape. */
function MenuItem({ title, keys }: { title: string; keys: string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--may-space-6)',
        minHeight: 'var(--may-control-h-sm)',
        padding: '0 var(--may-space-3)',
      }}
    >
      <Text variant="subheadline" as="span">
        {title}
      </Text>
      <Combo keys={keys} />
    </div>
  )
}

export const Default: Story = {}

/** Named keys resolve to Apple's glyphs, and keep their word for screen readers. */
export const Symbols: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-2)', flexWrap: 'wrap' }}>
      {['cmd', 'shift', 'option', 'control', 'enter', 'esc', 'tab', 'delete', 'space', 'up', 'down'].map(
        (key) => (
          <Kbd key={key}>{key}</Kbd>
        ),
      )}
    </div>
  ),
}

export const Combos: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)', maxWidth: 360 }}>
      {(
        [
          ['Spotlight', ['cmd', 'space']],
          ['Screenshot', ['shift', 'cmd', '4']],
          ['Force Quit', ['option', 'cmd', 'esc']],
          ['Switch app', ['cmd', 'tab']],
        ] as const
      ).map(([label, keys]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subheadline" tone="secondary" as="span">
            {label}
          </Text>
          <Combo keys={[...keys]} />
        </div>
      ))}
    </div>
  ),
}

/** Caps track the type around them, so a size is only needed to break that. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-4)', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Combo key={size} keys={['cmd', 'K']} size={size} />
      ))}
    </div>
  ),
}

/** A Mail-style menu. */
export const MenuShortcuts: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 320,
        padding: 'var(--may-space-2)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
        boxShadow: 'var(--may-shadow-md)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MenuItem title="New Message" keys={['cmd', 'N']} />
      <MenuItem title="Reply All" keys={['shift', 'cmd', 'R']} />
      <MenuItem title="Move to Junk" keys={['shift', 'cmd', 'J']} />
      <MenuItem title="Delete" keys={['delete']} />
    </div>
  ),
}

/**
 * `live` caps light up while the real key is held — press ⇧⌘4 and watch. The
 * release rides the same spring the rest of the system presses on.
 */
export const Live: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)' }}>
      <Text variant="footnote" tone="secondary">
        Hold the keys on a real keyboard.
      </Text>
      <span style={{ display: 'inline-flex', gap: 'var(--may-space-1)' }}>
        {['shift', 'cmd', '4'].map((key) => (
          <Kbd key={key} size="lg" live>
            {key}
          </Kbd>
        ))}
      </span>
    </div>
  ),
}
