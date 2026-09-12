import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IoAccessibility, IoCall, IoChatbubble } from 'react-icons/io5'
import { FloatingBubble } from '.'
import { List, ListRow } from '../../components/List'

const RingIcon = () => <IoAccessibility aria-hidden />

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

const PhoneIcon = () => <IoCall aria-hidden />

const MessageIcon = () => <IoChatbubble aria-hidden />

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
