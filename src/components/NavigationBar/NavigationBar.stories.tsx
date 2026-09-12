import type { Meta, StoryObj } from '@storybook/react'
import { useRef } from 'react'
import { Button } from '../Button'
import { NavigationBar } from '.'
import type { NavigationBarProps } from '.'

const meta = {
  title: 'Catalog/Adaptive/NavigationBar',
  component: NavigationBar,
  args: { title: 'Settings' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NavigationBar>

export default meta
type Story = StoryObj<typeof meta>

const ROWS = [
  ['Airplane Mode', 'Off'],
  ['Wi-Fi', 'HomeNet'],
  ['Bluetooth', 'On'],
  ['Cellular', 'Off'],
  ['Personal Hotspot', 'Off'],
  ['Notifications', ''],
  ['Sounds & Haptics', ''],
  ['Focus', '2 set up'],
  ['Screen Time', '3h 12m today'],
  ['General', ''],
  ['Control Centre', ''],
  ['Display & Brightness', 'Automatic'],
  ['Home Screen & App Library', ''],
  ['Accessibility', ''],
  ['Wallpaper', ''],
  ['Siri & Search', ''],
]

function Rows() {
  return (
    <div
      style={{
        margin: 'var(--may-space-4)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
        overflow: 'hidden',
      }}
    >
      {ROWS.map(([label, detail]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--may-space-4)',
            minHeight: 'var(--may-control-h)',
            padding: '0 var(--may-space-4)',
          }}
        >
          <span>{label}</span>
          <span style={{ color: 'var(--may-color-text-secondary)' }}>{detail}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * A pane that scrolls inside itself, which is what `scrollRef` is for.
 *
 * `transform: translateZ(0)` is load-bearing: a compact bar is `position:
 * fixed`, and without a transformed ancestor it would pin itself to the
 * viewport instead of to this pane. The TabBar stories' phone frame does the
 * same thing for the same reason.
 *
 * The compact bar overlays rather than occupying a row, so the content pads
 * itself past it with --may-nav-bar-space. A large title still sits in flow and
 * needs no padding at all.
 */
function Pane({ padded = true, ...props }: NavigationBarProps & { padded?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scroller}
      style={{
        height: 480,
        overflowY: 'auto',
        background: 'var(--may-color-bg)',
        transform: 'translateZ(0)',
      }}
    >
      <NavigationBar {...props} scrollRef={scroller} />
      <div style={{ paddingBlockStart: padded ? 'var(--may-nav-bar-space)' : undefined }}>
        <Rows />
      </div>
    </div>
  )
}

/**
 * Scroll the pane. The large title slides up under the bar and hands off to
 * the inline title, and the hairline arrives the moment there is content
 * underneath to separate from — all of it driven by one custom property that a
 * passive listener writes once a frame, never by React state.
 */
export const LargeTitle: Story = {
  args: { largeTitle: true, trailing: <Button variant="plain" size="md">Edit</Button> },
  render: (args) => <Pane {...args} padded={false} />,
}

/** A pushed view: back button leading, action trailing, title centred between
 * them however uneven the two ends are. */
export const PushedView: Story = {
  args: {
    title: 'Wi-Fi',
    onBack: () => {},
    backLabel: 'Settings',
    trailing: <Button variant="plain" size="md">Edit</Button>,
  },
  render: (args) => <Pane {...args} />,
}

/** Mail's status line lives under the title, in the same slot. */
export const WithSubtitle: Story = {
  args: {
    title: 'All Inboxes',
    subtitle: 'Updated Just Now',
    onBack: () => {},
    backLabel: 'Mailboxes',
    trailing: <Button variant="plain" size="md">Edit</Button>,
  },
  render: (args) => <Pane {...args} />,
}

/**
 * A long title truncates rather than pushing the two slots off the ends — the
 * three-column grid is what guarantees it stays optically centred.
 */
export const LongTitle: Story = {
  args: {
    title: 'Home Screen & App Library',
    onBack: () => {},
    trailing: <Button variant="plain" size="md">Done</Button>,
  },
  render: (args) => <Pane {...args} />,
}
