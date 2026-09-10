import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toast } from './Toast'
import { Button } from '../Button'

const meta = {
  title: 'Catalog/Adaptive/Toast',
  component: Toast,
  args: { title: 'Screenshot saved to Photos', duration: 0 },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'tint', 'success', 'warning', 'danger'] },
    position: {
      control: 'inline-radio',
      options: ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'],
    },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--may-space-3)',
  alignItems: 'flex-start',
} as const

/**
 * A toast on its own, out of the viewport, so the capsule can be read at rest.
 * `duration={0}` makes it sticky; anything else counts down and dismisses
 * itself, pausing while a cursor is over it.
 */
export const Default: Story = {
  render: (args) => <Toast {...args} onDismiss={() => {}} />,
}

/**
 * Tone is carried by a dot rather than by the capsule, which stays the same
 * elevated surface every time — a screen full of coloured banners is a web
 * page. Neutral gets no accent at all: an unremarkable message is just text.
 */
export const Tones: Story = {
  render: () => (
    <div style={column}>
      <Toast title="Screenshot saved to Photos" duration={0} onDismiss={() => {}} />
      <Toast
        tone="tint"
        title="AirDrop from Ada's iPhone"
        description="Accept to save 3 photos to your library."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast tone="success" title="Payment sent to Grace" duration={0} onDismiss={() => {}} />
      <Toast tone="warning" title="Low Power Mode is on" duration={0} onDismiss={() => {}} />
      <Toast
        tone="danger"
        title="Couldn't reach iCloud"
        description="Your drafts will sync when you're back online."
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
}

/**
 * A glyph replaces the dot, in a wash of the same tone — the weight Button's
 * `tinted` variant uses, so the two read as one family. An action sits at the
 * trailing edge and dismisses the toast once it has run.
 */
export const IconsAndActions: Story = {
  render: () => (
    <div style={column}>
      <Toast
        tone="success"
        icon={<CheckIcon />}
        title="Message sent"
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        tone="tint"
        icon={<TrashIcon />}
        title="Conversation deleted"
        description="Moved to Recently Deleted."
        action={{ label: 'Undo', onClick: () => {} }}
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        tone="danger"
        icon={<CloudIcon />}
        title="Backup failed"
        action={{ label: 'Retry', onClick: () => {} }}
        closeButton={false}
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
}

/**
 * Dismissal, hooked up. Drag one sideways — it tracks the finger and leaves in
 * the direction it was thrown — or press the chip. `dismissible={false}` on the
 * last one takes both away, for a toast that has to be acknowledged by its
 * action.
 */
export const Dismissing: Story = {
  render: () => {
    const [gone, setGone] = useState<string[]>([])
    const rows = [
      { id: 'a', title: 'Swipe me sideways', tone: 'neutral' as const },
      { id: 'b', title: 'Or press the chip', tone: 'tint' as const },
      { id: 'c', title: 'This one needs an answer', tone: 'warning' as const },
    ]
    return (
      <div style={column}>
        {rows
          .filter((row) => !gone.includes(row.id))
          .map((row) => (
            <Toast
              key={row.id}
              tone={row.tone}
              title={row.title}
              duration={0}
              dismissible={row.id !== 'c'}
              action={row.id === 'c' ? { label: 'Got it', onClick: () => {} } : undefined}
              onDismiss={() => setGone((current) => current.concat(row.id))}
            />
          ))}
        {gone.length > 0 && (
          <Button variant="gray" size="sm" onClick={() => setGone([])}>
            Bring them back
          </Button>
        )}
      </div>
    )
  },
}

/* --------------------------------- glyphs --------------------------------- */

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M5 12.5L10 17.5L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M7.5 18a4 4 0 010-8 5.5 5.5 0 0110.6 1.4A3.6 3.6 0 0117.5 18H7.5z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}
