import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NoticeBar } from './NoticeBar'
import { Button } from '../Button/Button'

const meta = {
  title: 'Catalog/Adaptive/NoticeBar',
  component: NoticeBar,
  args: { children: 'Personal Hotspot: 1 Connection' },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    speed: { control: { type: 'range', min: 16, max: 120, step: 4 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NoticeBar>

export default meta
type Story = StoryObj<typeof meta>

/** A bar is chrome, so the stories put it on the edge of something. */
const Screen = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      maxWidth: 420,
      borderRadius: 'var(--may-radius-sheet)',
      overflow: 'hidden',
      background: 'var(--may-color-surface)',
    }}
  >
    {children}
    <div
      style={{
        padding: 'var(--may-space-5) var(--may-space-4)',
        color: 'var(--may-color-text-secondary)',
        fontSize: 'var(--may-text-subheadline)',
      }}
    >
      Mail · 12 unread
    </div>
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Screen>
      <NoticeBar {...args} icon={<LinkIcon />} />
    </Screen>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)', maxWidth: 420 }}>
      <NoticeBar tone="tint" icon={<LinkIcon />}>
        Personal Hotspot: 1 Connection
      </NoticeBar>
      <NoticeBar tone="danger" icon={<RecordIcon />}>
        Screen Recording
      </NoticeBar>
      <NoticeBar tone="success" icon={<CheckIcon />}>
        Location Shared with Find My
      </NoticeBar>
      <NoticeBar tone="warning" icon={<BoltIcon />}>
        Low Power Mode is on
      </NoticeBar>
      <NoticeBar tone="neutral">Do Not Disturb until 8:00 AM</NoticeBar>
    </div>
  ),
}

/** Too long to fit, so it scrolls — and pauses while a pointer rests on it. */
export const Marquee: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)', maxWidth: 420 }}>
      <NoticeBar tone="warning" marquee icon={<BoltIcon />}>
        Flash Flood Warning in effect for this area until 9:00 PM. Avoid low-lying roads and
        move to higher ground if advised by local officials.
      </NoticeBar>
      <NoticeBar tone="neutral" marquee speed={80}>
        AAPL 232.14 ▲ 1.2% · MSFT 418.90 ▼ 0.4% · NVDA 121.55 ▲ 3.8% · TSLA 248.02 ▼ 2.1%
      </NoticeBar>
      {/* Short enough to fit, so `marquee` correctly does nothing at all. */}
      <NoticeBar tone="tint" marquee>
        Syncing…
      </NoticeBar>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Screen>
      <NoticeBar
        tone="danger"
        icon={<RecordIcon />}
        action={
          <Button size="xs" variant="plain">
            Stop
          </Button>
        }
      >
        Recording · 04:12
      </NoticeBar>
    </Screen>
  ),
}

/** Closing plays the bar back out the way it came in before it unmounts. */
export const Dismissible: Story = {
  render: () => <DismissDemo />,
}

function DismissDemo() {
  const [open, setOpen] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: 420 }}>
      <Screen>
        {open && (
          <NoticeBar
            tone="warning"
            icon={<BoltIcon />}
            marquee
            onClose={() => setOpen(false)}
            closeLabel="Dismiss battery notice"
            action={
              <Button size="xs" variant="plain">
                Settings
              </Button>
            }
          >
            Battery health has degraded. Peak performance capability may be limited to prevent
            unexpected shutdowns.
          </NoticeBar>
        )}
      </Screen>
      {!open && (
        <Button variant="gray" onClick={() => setOpen(true)}>
          Show the notice again
        </Button>
      )}
    </div>
  )
}

/* --------------------------- SF-Symbol-ish glyphs --------------------------- */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M8.4 11.6a3 3 0 0 0 4.3 0l2.4-2.4a3 3 0 0 0-4.3-4.3l-1 1" {...strokeProps} />
      <path d="M11.6 8.4a3 3 0 0 0-4.3 0l-2.4 2.4a3 3 0 0 0 4.3 4.3l1-1" {...strokeProps} />
    </svg>
  )
}

function RecordIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="4.6" fill="currentColor" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="8" {...strokeProps} />
      <path d="M6.4 10.3l2.5 2.5 4.8-5.4" {...strokeProps} />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M11.2 2.6L4.8 11h4.1l-1.1 6.4 6.4-8.4h-4.1z" {...strokeProps} />
    </svg>
  )
}
