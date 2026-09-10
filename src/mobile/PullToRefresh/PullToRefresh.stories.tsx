import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PullToRefresh } from './PullToRefresh'
import { List, ListRow } from '../../components/List'

const meta = {
  title: 'Catalog/Mobile/PullToRefresh',
  component: PullToRefresh,
  args: { onRefresh: () => {} },
  argTypes: {
    threshold: { control: { type: 'range', min: 32, max: 160, step: 4 } },
    max: { control: { type: 'range', min: 60, max: 240, step: 4 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PullToRefresh>

export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A phone-sized frame, so the scroller has a bounded height to fill. */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: 440,
        maxWidth: 420,
        display: 'flex',
        borderRadius: 'var(--may-radius-sheet)',
        overflow: 'hidden',
        background: 'var(--may-color-bg)',
      }}
    >
      {children}
    </div>
  )
}

interface Message {
  from: string
  subject: string
  preview: string
  at: string
}

const INBOX: Message[] = [
  { from: 'Ada Lovelace', subject: 'Re: Analytical Engine', preview: 'The notes are ready for review — I have folded in your corrections from Tuesday.', at: '9:41 AM' },
  { from: 'App Store', subject: 'Your app is now available', preview: 'May UI 1.0 is live in all 175 territories.', at: '8:02 AM' },
  { from: 'Grace Hopper', subject: 'Compiler timings', preview: 'Down to 400ms cold. Chart attached.', at: 'Yesterday' },
  { from: 'TestFlight', subject: 'Build 214 is ready to test', preview: 'This build expires in 89 days.', at: 'Yesterday' },
  { from: 'Katherine Johnson', subject: 'Trajectory review', preview: 'Numbers check out. Let us run it once more with the new drag figures.', at: 'Monday' },
  { from: 'Radar', subject: 'FB13391045 was resolved', preview: 'Marked as fixed in the next seed.', at: 'Monday' },
]

/**
 * The Mail shape. Pull down — with a finger or by dragging with the mouse — and
 * the ring fills spoke by spoke as you approach the threshold, pops past full
 * size the moment releasing would refresh, then spins until the promise settles.
 */
export const Inbox: Story = {
  render: (args) => {
    const [messages, setMessages] = useState(INBOX)
    return (
      <Phone>
        <PullToRefresh
          {...args}
          onRefresh={async () => {
            await wait(1400)
            setMessages((current) => [
              {
                from: 'Alan Turing',
                subject: 'On computable numbers',
                preview: `Fetched at ${new Date().toLocaleTimeString()}.`,
                at: 'now',
              },
              ...current,
            ])
          }}
        >
          <div style={{ padding: 'var(--may-space-4)' }}>
            <List>
              {messages.map((message) => (
                <ListRow
                  key={message.subject + message.at}
                  title={message.from}
                  subtitle={message.preview}
                  detail={message.at}
                  onClick={() => {}}
                />
              ))}
            </List>
          </div>
        </PullToRefresh>
      </Phone>
    )
  },
}

/** Grouped settings refresh the same way, and the rows below stay tappable. */
export const Settings: Story = {
  render: (args) => {
    const [checkedAt, setCheckedAt] = useState('Never')
    return (
      <Phone>
        <PullToRefresh
          {...args}
          onRefresh={async () => {
            await wait(900)
            setCheckedAt(new Date().toLocaleTimeString())
          }}
        >
          <div
            style={{
              padding: 'var(--may-space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--may-space-4)',
            }}
          >
            <List header="Software Update" footer={`Last checked ${checkedAt}.`}>
              <ListRow title="Automatic Updates" detail="On" onClick={() => {}} />
              <ListRow title="Beta Updates" detail="Off" onClick={() => {}} />
            </List>
            <List header="Storage">
              <ListRow title="iPhone Storage" detail="142.6 GB" onClick={() => {}} />
              <ListRow title="iCloud" detail="2 TB" onClick={() => {}} />
              <ListRow title="Offload Unused Apps" detail="Off" onClick={() => {}} />
            </List>
          </div>
        </PullToRefresh>
      </Phone>
    )
  },
}

/**
 * A long refresh. The indicator holds at the threshold for as long as the
 * promise takes, which is the point of taking a promise rather than a duration.
 */
export const SlowNetwork: Story = {
  render: (args) => (
    <Phone>
      <PullToRefresh {...args} threshold={80} onRefresh={() => wait(4000)}>
        <div style={{ padding: 'var(--may-space-4)' }}>
          <List header="Mailboxes" footer="Refreshing takes four seconds here, on purpose.">
            <ListRow title="All Inboxes" detail="12" onClick={() => {}} />
            <ListRow title="iCloud" detail="4" onClick={() => {}} />
            <ListRow title="Work" detail="8" onClick={() => {}} />
            <ListRow title="VIP" onClick={() => {}} />
          </List>
        </div>
      </PullToRefresh>
    </Phone>
  ),
}

/** Disabled: the list still scrolls, the gesture simply never starts. */
export const Disabled: Story = {
  render: (args) => (
    <Phone>
      <PullToRefresh {...args} disabled>
        <div style={{ padding: 'var(--may-space-4)' }}>
          <List header="Archive" footer="Pull-to-refresh is off for this list.">
            {INBOX.map((message) => (
              <ListRow key={message.subject} title={message.from} subtitle={message.subject} />
            ))}
          </List>
        </div>
      </PullToRefresh>
    </Phone>
  ),
}
