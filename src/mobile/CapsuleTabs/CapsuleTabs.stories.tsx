import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CapsuleTabs } from '.'
import { List, ListRow } from '../../components/List'

const meta = {
  title: 'Catalog/Mobile/CapsuleTabs',
  component: CapsuleTabs,
  args: {
    'aria-label': 'Filter',
    items: [
      { value: 'all', label: 'All' },
      { value: 'unread', label: 'Unread' },
      { value: 'flagged', label: 'Flagged' },
      { value: 'attachments', label: 'Attachments' },
    ],
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tinted', 'surface'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CapsuleTabs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The thumb slides between capsules rather than cross-fading between two copies
 * of itself — the same `applyThumb` that drives SegmentedControl, and the
 * detail that separates a native-feeling strip from a row of web chips.
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('all')
    return (
      <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
        <CapsuleTabs {...args} value={value} onValueChange={setValue} />
        <List>
          {(MAIL[value] ?? []).map((message) => (
            <ListRow
              key={message.from}
              title={message.from}
              subtitle={message.subject}
              detail={message.at}
              onClick={() => {}}
            />
          ))}
        </List>
      </div>
    )
  },
}

/**
 * `filled` is App Store's search filter, `tinted` the same capsule as a wash,
 * and `surface` recesses the track and floats the pill on it — SegmentedControl's
 * shape stretched into a scroller.
 */
export const Variants: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-6)' }}>
      {(['filled', 'tinted', 'surface'] as const).map((variant) => (
        <CapsuleTabs
          {...args}
          key={variant}
          variant={variant}
          defaultValue="unread"
          aria-label={`Filter (${variant})`}
        />
      ))}
    </div>
  ),
}

/**
 * More genres than fit. Pick one at the far end with the keyboard, or tap one
 * that is half off the edge, and the strip scrolls it back into view — with a
 * chip's worth of peek left over, so it never looks like it has run out.
 */
export const Scrollable: Story = {
  args: {
    'aria-label': 'Genre',
    items: [
      { value: 'browse', label: 'Browse' },
      { value: 'made-for-you', label: 'Made for You' },
      { value: 'new', label: 'New Releases' },
      { value: 'hip-hop', label: 'Hip-Hop' },
      { value: 'jazz', label: 'Jazz' },
      { value: 'classical', label: 'Classical' },
      { value: 'ambient', label: 'Ambient' },
      { value: 'soundtracks', label: 'Soundtracks' },
      { value: 'live', label: 'Live Sessions', disabled: true },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState('browse')
    return (
      <div style={{ maxWidth: 320 }}>
        <CapsuleTabs {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
}

/**
 * Counts ride inside the capsule and take their colour from the label, so one
 * rule is right on a solid thumb, on a tinted one and on an unselected chip.
 */
export const WithCounts: Story = {
  args: {
    'aria-label': 'Downloads',
    variant: 'tinted',
    items: [
      { value: 'all', label: 'All', count: 42 },
      { value: 'updates', label: 'Updates', count: 7 },
      { value: 'installed', label: 'Installed', count: 128 },
      { value: 'purchased', label: 'Purchased' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <CapsuleTabs {...args} defaultValue="updates" />
    </div>
  ),
}

/** Every rung keeps a full 44px touch target, including the one drawn smaller than it. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-5)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <CapsuleTabs
          {...args}
          key={size}
          size={size}
          variant="surface"
          defaultValue="flagged"
          aria-label={`Filter (${size})`}
        />
      ))}
    </div>
  ),
}

/* --------------------------------- content -------------------------------- */

interface Message {
  from: string
  subject: string
  at: string
}

const MAIL: Record<string, Message[]> = {
  all: [
    { from: 'Grace Hopper', subject: 'Compiler notes — the A-0 write-up', at: '9:41' },
    { from: 'TestFlight', subject: 'Halide 2.11 is ready to test', at: 'Tuesday' },
    { from: 'Katherine Johnson', subject: 'Re: trajectory review', at: 'Monday' },
  ],
  unread: [{ from: 'Grace Hopper', subject: 'Compiler notes — the A-0 write-up', at: '9:41' }],
  flagged: [{ from: 'Katherine Johnson', subject: 'Re: trajectory review', at: 'Monday' }],
  attachments: [
    { from: 'TestFlight', subject: 'Halide 2.11 is ready to test', at: 'Tuesday' },
    { from: 'Katherine Johnson', subject: 'Re: trajectory review', at: 'Monday' },
  ],
}
