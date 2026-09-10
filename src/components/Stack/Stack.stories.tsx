import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from './Stack'

const meta = {
  title: 'Catalog/Adaptive/Stack',
  component: Stack,
  args: { gap: 3 },
  argTypes: {
    direction: { control: 'inline-radio', options: ['row', 'column'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: 'var(--may-color-surface)',
      borderRadius: 'var(--may-radius-card)',
      padding: 'var(--may-space-4)',
      fontSize: 'var(--may-text-body)',
    }}
  >
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Card>Wi-Fi</Card>
      <Card>Bluetooth</Card>
      <Card>Cellular</Card>
    </Stack>
  ),
}

/** A nav bar: title centred, actions pinned to the edges, one row of flex. */
export const NavBar: Story = {
  render: () => (
    <Stack
      direction="row"
      align="center"
      justify="between"
      gap={3}
      style={{
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        padding: 'var(--may-space-3) var(--may-space-4)',
      }}
    >
      <span style={{ color: 'var(--may-color-tint)', fontSize: 'var(--may-text-body)' }}>Mailboxes</span>
      <span
        style={{
          fontSize: 'var(--may-text-headline)',
          fontWeight: 'var(--may-text-headline-weight)',
          letterSpacing: 'var(--may-text-headline-tracking)',
        }}
      >
        Inbox
      </span>
      <span style={{ color: 'var(--may-color-tint)', fontSize: 'var(--may-text-body)' }}>Edit</span>
    </Stack>
  ),
}

/** Vertical stacks nest inside horizontal ones — the shape of every list row. */
export const ContactRow: Story = {
  render: () => (
    <Stack
      direction="row"
      align="center"
      gap={3}
      style={{
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        padding: 'var(--may-space-4)',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 'var(--may-radius-full)',
          background: 'var(--may-grad-indigo)',
        }}
      />
      <Stack gap={0} style={{ flex: 1 }}>
        <span style={{ fontSize: 'var(--may-text-headline)', fontWeight: 600 }}>Craig Federighi</span>
        <span style={{ fontSize: 'var(--may-text-footnote)', color: 'var(--may-color-text-secondary)' }}>
          Re: Notification Summaries
        </span>
      </Stack>
      <span style={{ fontSize: 'var(--may-text-footnote)', color: 'var(--may-color-text-tertiary)' }}>
        9:41 AM
      </span>
    </Stack>
  ),
}

/** `wrap` turns a row into a chip field that reflows instead of overflowing. */
export const Wrapping: Story = {
  render: () => (
    <Stack direction="row" gap={2} wrap>
      {['All Mail', 'Unread', 'Flagged', 'To or CC Me', 'Attachments', 'Today'].map((tag) => (
        <span
          key={tag}
          style={{
            padding: 'var(--may-space-2) var(--may-space-4)',
            borderRadius: 'var(--may-radius-full)',
            background: 'var(--may-color-fill-tertiary)',
            fontSize: 'var(--may-text-subheadline)',
          }}
        >
          {tag}
        </span>
      ))}
    </Stack>
  ),
}
