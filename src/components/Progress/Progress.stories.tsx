import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { CircularProgress, Progress } from './Progress'

const meta = {
  title: 'Catalog/Adaptive/Progress',
  component: Progress,
  args: { value: 62 },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--may-space-6)',
      maxWidth: 420,
    }}
  >
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Column>
      <Progress {...args} label="Downloading" showValue />
    </Column>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Column>
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <Progress key={s} {...args} size={s} label={s} showValue />
      ))}
    </Column>
  ),
}

/** Rings carry their own value in the middle, which is why iOS uses them in rows. */
export const Rings: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
      <CircularProgress size="xs" value={25} aria-label="Sync" />
      <CircularProgress size="sm" value={50} tone="success" aria-label="Backup" />
      <CircularProgress size="md" value={72} showValue aria-label="Upload" />
      <CircularProgress size="lg" value={88} showValue tone="warning" aria-label="Storage used" />
      <CircularProgress size="lg" value={4.6} max={5} tone="danger" aria-label="Storage">
        <span style={{ fontSize: 'var(--may-text-caption-1)' }}>4.6 GB</span>
      </CircularProgress>
    </div>
  ),
}

/** Work is happening, but nothing yet knows how much of it there is. */
export const Indeterminate: Story = {
  render: () => (
    <Column>
      <Progress indeterminate label="Looking for devices" aria-label="Looking for devices" />
      <div style={{ display: 'flex', gap: 'var(--may-space-6)', alignItems: 'center' }}>
        <CircularProgress indeterminate size="sm" aria-label="Connecting" />
        <CircularProgress indeterminate size="md" tone="success" aria-label="Connecting" />
        <CircularProgress indeterminate size="lg" tone="neutral" aria-label="Connecting" />
      </div>
    </Column>
  ),
}

/** The bar springs to each new value, which is what a real download looks like. */
export const SoftwareUpdate: Story = {
  render: () => <UpdateCard />,
}

const TOTAL_MB = 2480

function UpdateCard() {
  const [downloaded, setDownloaded] = useState(180)

  useEffect(() => {
    // Uneven steps on purpose — a perfectly linear bar reads as a fake.
    const id = setInterval(() => {
      setDownloaded((mb) => (mb >= TOTAL_MB ? 180 : Math.min(TOTAL_MB, mb + 120 + Math.random() * 320)))
    }, 900)
    return () => clearInterval(id)
  }, [])

  const done = downloaded >= TOTAL_MB

  return (
    <div
      style={{
        maxWidth: 420,
        display: 'flex',
        gap: 'var(--may-space-4)',
        alignItems: 'center',
        padding: 'var(--may-space-4)',
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
      }}
    >
      <CircularProgress
        size="lg"
        value={downloaded}
        max={TOTAL_MB}
        tone={done ? 'success' : 'tint'}
        showValue
        aria-label="Download progress"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Progress
          value={downloaded}
          max={TOTAL_MB}
          tone={done ? 'success' : 'tint'}
          label="iOS 26.1"
          showValue
          formatValue={(v, max) => `${(v / 1024).toFixed(1)} of ${(max / 1024).toFixed(1)} GB`}
        />
      </div>
    </div>
  )
}
