import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import { MayHost } from './MayHost'
import { dismissAll, toast, useToast } from '../Toast/Toast'
import type { ToastPosition } from '../Toast/Toast'
import { Button } from '../Button'

const meta = {
  title: 'Catalog/Adaptive/MayHost',
  component: MayHost,
  args: { max: 3 },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'],
    },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MayHost>

export default meta
type Story = StoryObj<typeof meta>

const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--may-space-2)',
  alignItems: 'center',
} as const

/**
 * Mount the host once, then call `toast()` from anywhere — no context, no ref,
 * no provider between the call site and the screen.
 *
 * With no `position` set the host picks per platform: top centre on a phone,
 * top trailing on a desktop, which is where each OS puts its own notifications.
 * Narrow the viewport past 1024px to watch it switch.
 */
export const Default: Story = {
  render: (args) => (
    <>
      <div style={row}>
        <Button onClick={() => toast('Link copied')}>Copy link</Button>
        <Button variant="gray" onClick={() => toast.success('Photo saved to Recents')}>
          Save photo
        </Button>
        <Button variant="gray" onClick={() => toast.warning('Low Power Mode is on')}>
          Battery
        </Button>
        <Button variant="gray" tone="danger" onClick={() => toast.danger("Couldn't reach iCloud")}>
          Fail
        </Button>
      </div>
      <MayHost {...args} />
    </>
  ),
}

/**
 * Six placements, all safe-area aware. A toast swipes away toward the edge it
 * is anchored to — or sideways from any of them — and rubber-bands if you drag
 * it the other way, so it can never be peeled off its own edge.
 */
export const Positions: Story = {
  render: () => {
    const positions: ToastPosition[] = [
      'top-start',
      'top-center',
      'top-end',
      'bottom-start',
      'bottom-center',
      'bottom-end',
    ]
    return (
      <>
        <div style={row}>
          {positions.map((position) => (
            <Button
              key={position}
              variant="gray"
              size="sm"
              onClick={() => toast(position, { position, tone: 'tint', duration: 0 })}
            >
              {position}
            </Button>
          ))}
          <Button variant="plain" size="sm" onClick={dismissAll}>
            Dismiss all
          </Button>
        </div>
        <MayHost />
      </>
    )
  },
}

/**
 * The queue is FIFO with a ceiling: past `max`, the oldest toast is dismissed
 * to make room rather than the newest being dropped — you always see what just
 * happened. Fire six and watch the stack stay three deep.
 */
export const StackLimit: Story = {
  args: { max: 3, position: 'bottom-end' },
  render: (args) => {
    const { toasts } = useToast()
    const mailbox = [
      'Grace Hopper — Re: launch window',
      'Ada Lovelace — Notes from Thursday',
      'Katherine J. — Trajectory review',
      'Margaret H. — Guidance build 4',
      'Radia P. — Spanning tree draft',
      'Barbara L. — Telescope time',
    ]
    return (
      <>
        <div style={row}>
          <Button
            onClick={() => mailbox.forEach((subject) => toast(subject, { tone: 'tint' }))}
          >
            Deliver 6 messages
          </Button>
          <span style={{ color: 'var(--may-color-text-secondary)' }}>
            {toasts.length} in the queue
          </span>
        </div>
        <MayHost {...args} />
      </>
    )
  },
}

/**
 * A sticky toast (`duration: 0`) that updates in place. Re-using the id keeps
 * the same capsule on screen and swaps its contents, so a long operation never
 * queues a second toast next to the one already reporting it.
 */
export const ProgressAndActions: Story = {
  args: { position: 'bottom-center' },
  render: (args) => {
    const timers = useRef<ReturnType<typeof setTimeout>[]>([])
    useEffect(() => () => timers.current.forEach(clearTimeout), [])

    const send = () => {
      const id = toast('Sending…', { duration: 0, tone: 'tint' })
      timers.current.push(
        setTimeout(
          () =>
            toast('Message sent', {
              id,
              tone: 'success',
              duration: 4000,
              action: { label: 'Undo', onClick: () => toast('Send cancelled') },
            }),
          1600,
        ),
      )
    }

    return (
      <>
        <div style={row}>
          <Button onClick={send}>Send message</Button>
          <Button
            variant="gray"
            onClick={() =>
              toast('Photo deleted', {
                icon: <TrashIcon />,
                duration: 0,
                action: { label: 'Undo', onClick: () => toast.success('Photo restored') },
              })
            }
          >
            Delete photo
          </Button>
        </div>
        <MayHost {...args} />
      </>
    )
  },
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M4 7h16M9.5 7V5h5v2M6.5 7l1 12h9l1-12M10 10.5v5M14 10.5v5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
