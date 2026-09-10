import type { Meta, StoryObj } from '@storybook/react'
import { IoCopyOutline, IoShareOutline, IoTrashOutline } from 'react-icons/io5'
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
            { label: 'Share…', icon: <IoShareOutline aria-hidden />, onSelect: () => setLast('Share') },
            { label: 'Duplicate', icon: <IoCopyOutline aria-hidden />, onSelect: () => setLast('Duplicate') },
            { label: 'Add to Album', onSelect: () => setLast('Add to Album') },
            {
              label: 'Delete Photo',
              icon: <IoTrashOutline aria-hidden />,
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
