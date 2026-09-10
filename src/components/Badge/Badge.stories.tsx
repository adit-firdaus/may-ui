import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Badge } from './Badge'
import { Button } from '../Button/Button'
import { List, ListRow } from '../List/List'

const meta = {
  title: 'Catalog/Adaptive/Badge',
  component: Badge,
  args: { children: 'Active' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['tinted', 'solid'] },
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)' }}>
      <Row>
        <Badge tone="success">Delivered</Badge>
        <Badge tone="warning">Pending</Badge>
        <Badge tone="danger">Failed</Badge>
        <Badge tone="tint">Beta</Badge>
        <Badge tone="neutral">Draft</Badge>
      </Row>
      <Row>
        <Badge variant="solid" tone="success">Delivered</Badge>
        <Badge variant="solid" tone="warning">Pending</Badge>
        <Badge variant="solid" tone="danger">Failed</Badge>
        <Badge variant="solid" tone="tint">Beta</Badge>
        <Badge variant="solid" tone="neutral">Draft</Badge>
      </Row>
    </div>
  ),
}

/** The dot form is a live status: Focus on, screen sharing, device connected. */
export const Dots: Story = {
  render: () => (
    <Row>
      <Badge dot tone="success" size="md" aria-label="Online" />
      <Badge dot tone="warning" size="md" aria-label="Away" />
      <Badge dot tone="danger" size="md" aria-label="Do Not Disturb" />
      <Badge dot tone="success">Connected</Badge>
      <Badge dot tone="danger" variant="solid">Recording</Badge>
    </Row>
  ),
}

/** Counts are circular at one digit and stretch into a pill at three. */
export const Counts: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <List header="Mailboxes">
        <ListRow
          title="All Inboxes"
          accessory={<Badge count={12} variant="solid" tone="tint" size="md" />}
          onClick={() => {}}
          chevron
        />
        <ListRow
          title="iCloud"
          accessory={<Badge count={3} variant="solid" tone="tint" size="md" />}
          onClick={() => {}}
          chevron
        />
        <ListRow
          title="Junk"
          accessory={<Badge count={148} variant="solid" tone="neutral" size="md" />}
          onClick={() => {}}
          chevron
        />
        <ListRow title="Archive" onClick={() => {}} chevron />
      </List>
    </div>
  ),
}

/**
 * The reason the count shape exists: it pops when the number changes, so a
 * count that moves while you are looking elsewhere is still noticed.
 */
export const CountPop: Story = {
  render: () => <PopDemo />,
}

function PopDemo() {
  const [count, setCount] = useState(1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-4)' }}>
      <Badge count={count} variant="solid" tone="danger" size="lg" />
      <Button size="sm" variant="gray" onClick={() => setCount((n) => n + 1)}>
        New message
      </Button>
      <Button size="sm" variant="plain" onClick={() => setCount(0)}>
        Mark all read
      </Button>
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <Row>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Badge key={s} size={s} tone="tint" variant="solid">
          {s}
        </Badge>
      ))}
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Badge key={`c-${s}`} size={s} tone="danger" variant="solid" count={9} />
      ))}
    </Row>
  ),
}
