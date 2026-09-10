import type { Meta, StoryObj } from '@storybook/react'
import {
  IoDownloadOutline,
  IoMailOutline,
  IoRadioOutline,
  IoSearchOutline,
} from 'react-icons/io5'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'
import { Card } from '../Card'

const meta = {
  title: 'Catalog/Adaptive/EmptyState',
  component: EmptyState,
  args: { title: 'No Mail' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An empty state is not an error, so nothing here is saturated except the
 * action. The three parts arrive staggered, top-down.
 */
export const Default: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      glyph={<IoMailOutline aria-hidden />}
      title="No Mail"
      description="You have read everything in this mailbox. New messages will appear here."
    />
  ),
}

/** With an action — the one element allowed to carry colour. */
export const WithAction: Story = {
  render: () => (
    <EmptyState
      glyph={<IoRadioOutline aria-hidden />}
      title="No People Nearby"
      description="AirDrop finds people who have their iPhone or Mac unlocked and nearby."
      action={
        <>
          <Button variant="gray">Learn More</Button>
          <Button>Turn On Bluetooth</Button>
        </>
      }
    />
  ),
}

/** Three sizes: a card slot, a screen, and a whole window. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Card key={size} variant="grouped" padding="none">
          <EmptyState
            size={size}
            glyph={<IoSearchOutline aria-hidden />}
            title="No Results"
            description={`Nothing matched “tokyo” in this mailbox. (size: ${size})`}
          />
        </Card>
      ))}
    </div>
  ),
}

/** Dropped into a card as the placeholder for a list that has no rows yet. */
export const InACard: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Card padding="none">
        <EmptyState
          size="sm"
          glyph={<IoDownloadOutline aria-hidden />}
          title="No Downloads"
          description="Files you download will appear here."
          action={<Button size="sm" variant="tinted">Browse Files</Button>}
        />
      </Card>
    </div>
  ),
}
