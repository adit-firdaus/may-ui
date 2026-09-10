import type { Meta, StoryObj } from '@storybook/react'
import { useRef, useState } from 'react'
import { ActionSheet } from './ActionSheet'
import { Button } from '../Button'

const meta = {
  title: 'Catalog/Adaptive/ActionSheet',
  component: ActionSheet,
  args: { open: false, onClose: () => {}, actions: [] },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ActionSheet>

export default meta
type Story = StoryObj<typeof meta>

const Share = () => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path
      d="M8 10.5V2m0 0L5.25 4.75M8 2l2.75 2.75M3.5 8.5v4a1 1 0 001 1h7a1 1 0 001-1v-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Trash = () => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path
      d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.1a1 1 0 001 .9h3.8a1 1 0 001-.9l.6-8.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Duplicate = () => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path
      d="M5.5 5.5V3.5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-2M3.5 5.5h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * The same actions in two genuinely different shapes. Below the desktop
 * breakpoint: full-width rows at the bottom edge with Cancel in its own group.
 * Above it: a menu anchored to the button, with no Cancel row — Escape and a
 * click anywhere else already do that job. Narrow the viewport to switch.
 */
export const Adaptive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [last, setLast] = useState('nothing yet')
    const anchor = useRef<HTMLButtonElement>(null)

    return (
      <div style={{ display: 'grid', gap: 'var(--may-space-3)', justifyItems: 'center' }}>
        <Button ref={anchor} variant="tinted" onClick={() => setOpen(true)}>
          IMG_4021.HEIC
        </Button>
        <span style={{ color: 'var(--may-color-text-secondary)' }}>Last action: {last}</span>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchor}
          title="IMG_4021.HEIC"
          description="Taken 14 June at Vík í Mýrdal"
          actions={[
            { label: 'Share…', icon: <Share />, onSelect: () => setLast('Share') },
            { label: 'Duplicate', icon: <Duplicate />, onSelect: () => setLast('Duplicate') },
            { label: 'Add to Album', onSelect: () => setLast('Add to Album') },
            {
              label: 'Delete Photo',
              icon: <Trash />,
              destructive: true,
              onSelect: () => setLast('Delete Photo'),
            },
          ]}
        />
      </div>
    )
  },
}

/**
 * With no `anchorRef` the desktop shape has nothing to hang from, so the menu
 * presents centred instead. The phone shape is unchanged either way.
 */
export const Unanchored: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add attachment</Button>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          actions={[
            { label: 'Photo Library', onSelect: () => {} },
            { label: 'Take Photo or Video', onSelect: () => {} },
            { label: 'Choose File', onSelect: () => {} },
          ]}
        />
      </>
    )
  },
}

/** Destructive actions sort last, and a row with nothing to act on is disabled. */
export const DestructiveAndDisabled: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const anchor = useRef<HTMLButtonElement>(null)
    return (
      <>
        <Button ref={anchor} tone="danger" variant="tinted" onClick={() => setOpen(true)}>
          Manage account
        </Button>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchor}
          title="ada@lovelace.dev"
          actions={[
            { label: 'Fetch New Data', onSelect: () => {} },
            { label: 'Download Attachments', disabled: true, onSelect: () => {} },
            { label: 'Sign Out', destructive: true, onSelect: () => {} },
            { label: 'Delete Account', destructive: true, onSelect: () => {} },
          ]}
        />
      </>
    )
  },
}

/** No title and no description — a bare list of commands, which is what a menu usually is. */
export const CommandsOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const anchor = useRef<HTMLButtonElement>(null)
    return (
      <>
        <Button ref={anchor} variant="gray" onClick={() => setOpen(true)}>
          Sort by
        </Button>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchor}
          cancelLabel="Not now"
          actions={[
            { label: 'Name', onSelect: () => {} },
            { label: 'Date Added', onSelect: () => {} },
            { label: 'Date Modified', onSelect: () => {} },
            { label: 'Size', onSelect: () => {} },
            { label: 'Kind', onSelect: () => {} },
          ]}
        />
      </>
    )
  },
}
