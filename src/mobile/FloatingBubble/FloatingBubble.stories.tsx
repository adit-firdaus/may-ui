import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FloatingBubble } from './FloatingBubble'
import { List, ListRow } from '../../components/List'

const RingIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="10" cy="10" r="2.6" fill="currentColor" />
  </svg>
)

const meta = {
  title: 'Catalog/Mobile/FloatingBubble',
  component: FloatingBubble,
  args: { 'aria-label': 'Accessibility shortcuts', icon: <RingIcon /> },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    defaultEdge: { control: 'inline-radio', options: ['start', 'end'] },
    defaultOffset: { control: { type: 'range', min: 0, max: 1, step: 0.02 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FloatingBubble>

export default meta
type Story = StoryObj<typeof meta>

const PhoneIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path
      d="M6.2 3.5 8 6.4 6.6 8.1a9 9 0 0 0 5.3 5.3l1.7-1.4 2.9 1.8v2.3c0 .8-.7 1.4-1.5 1.3C8.4 16.7 3.3 11.6 2.4 5c-.1-.8.5-1.5 1.3-1.5z"
      fill="currentColor"
    />
  </svg>
)

const MessageIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden focusable="false">
    <path
      d="M10 3.2c4.1 0 7.3 2.6 7.3 5.9 0 3.2-3.2 5.8-7.3 5.8-.7 0-1.4-.1-2-.2l-3.5 1.8.9-2.8c-1.6-1.1-2.7-2.7-2.7-4.6 0-3.3 3.2-5.9 7.3-5.9"
      fill="currentColor"
    />
  </svg>
)

/**
 * AssistiveTouch. Drag it anywhere — it resists past the safe area rather than
 * stopping dead — then let go: it flies to whichever side edge the throw was
 * headed for, not necessarily the one it is nearest. Tapping it still works,
 * because a tap is not a drag.
 */
export const AssistiveTouch: Story = {
  render: (args) => {
    const [taps, setTaps] = useState(0)
    const [edge, setEdge] = useState<'start' | 'end'>('end')
    return (
      <div style={{ maxWidth: 460 }}>
        <List header="Accessibility" footer={`Parked on the ${edge} edge · tapped ${taps} times`}>
          <ListRow title="AssistiveTouch" detail="On" onClick={() => {}} />
          <ListRow title="Touch Accommodations" detail="Off" onClick={() => {}} />
          <ListRow title="Back Tap" detail="Screenshot" onClick={() => {}} />
          <ListRow title="Reachability" accessory={<span aria-hidden>On</span>} />
        </List>
        <FloatingBubble {...args} onEdgeChange={setEdge} onClick={() => setTaps((n) => n + 1)} />
      </div>
    )
  },
}

/** A label extends the circle into a pill — a call you can put down and pick up. */
export const CallInProgress: Story = {
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <List header="Recents" footer="Drag the pill to either edge.">
        <ListRow title="Ada Lovelace" subtitle="mobile" detail="9:41 AM" onClick={() => {}} />
        <ListRow title="Grace Hopper" subtitle="FaceTime Audio" detail="Yesterday" onClick={() => {}} />
        <ListRow title="Katherine Johnson" subtitle="mobile" detail="Monday" onClick={() => {}} />
      </List>
      <FloatingBubble
        {...args}
        icon={<PhoneIcon />}
        aria-label="Return to call"
        tone="success"
        defaultEdge="start"
        defaultOffset={0.2}
      >
        02:14
      </FloatingBubble>
    </div>
  ),
}

/** Sizes and tones, parked down one edge so they do not land on top of each other. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <List header="Bubbles" footer="Throw any of them across; each one keeps its own edge.">
        <ListRow title="Small" detail="control-h-md" />
        <ListRow title="Medium" detail="control-h-lg" />
        <ListRow title="Large" detail="control-h-lg + 2" />
      </List>
      <FloatingBubble {...args} size="sm" tone="neutral" aria-label="Small bubble" defaultOffset={0.25} />
      <FloatingBubble {...args} size="md" tone="tint" aria-label="Medium bubble" defaultOffset={0.5} />
      <FloatingBubble
        {...args}
        size="lg"
        tone="danger"
        icon={<MessageIcon />}
        aria-label="Large bubble"
        defaultOffset={0.75}
      />
    </div>
  ),
}

/** Disabled: it cannot be dragged and cannot be tapped, and says so. */
export const Disabled: Story = {
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <List header="Guided Access" footer="The bubble is inert while Guided Access is on.">
        <ListRow title="Guided Access" detail="On" onClick={() => {}} />
        <ListRow title="Passcode Settings" onClick={() => {}} />
      </List>
      <FloatingBubble {...args} disabled defaultOffset={0.4} />
    </div>
  ),
}
