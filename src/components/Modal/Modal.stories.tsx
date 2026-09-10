import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '../Button'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Modal',
  component: Modal,
  args: { open: false, onClose: () => {} },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A modal keeps its shape at every width — narrow the viewport and it stays
 * centred, where a `Sheet` would have reshaped into a bottom sheet. Only the
 * footer adapts: stacked full-width on a phone, inline on desktop.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add to Album</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Add to Album"
          description="Choose where these 3 photos should go."
          footer={
            <>
              <Button variant="gray" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button autoFocus onClick={() => setOpen(false)}>
                Add
              </Button>
            </>
          }
        >
          <List>
            <ListRow title="Recents" detail="4,312" onClick={() => {}} />
            <ListRow title="Favourites" detail="86" onClick={() => {}} />
            <ListRow title="Iceland 2024" detail="211" onClick={() => {}} />
            <ListRow title="Screenshots" detail="1,904" onClick={() => {}} />
          </List>
        </Modal>
      </>
    )
  },
}

/** Four widths. On a phone every one of them fills the available width. */
export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full' | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--may-space-2)' }}>
          {(['sm', 'md', 'lg', 'full'] as const).map((s) => (
            <Button key={s} variant="gray" onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Modal
          open={size !== null}
          onClose={() => setSize(null)}
          size={size ?? 'md'}
          title={`iCloud Storage — size "${size}"`}
          description="50 GB of 200 GB used."
          footer={<Button onClick={() => setSize(null)}>Done</Button>}
        >
          <List header="Storage plans">
            <ListRow title="50 GB" detail="£0.99 / month" onClick={() => {}} />
            <ListRow title="200 GB" subtitle="Current plan" detail="£2.99 / month" onClick={() => {}} />
            <ListRow title="2 TB" detail="£8.99 / month" onClick={() => {}} />
          </List>
        </Modal>
      </>
    )
  },
}

/** Long content scrolls inside the body; the header and footer stay put. */
export const ScrollingBody: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="tinted" onClick={() => setOpen(true)}>
          Software Update
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          title="iOS 18.2"
          description="Apple Inc. — 3.1 GB"
          footer={
            <>
              <Button variant="gray" onClick={() => setOpen(false)}>
                Later
              </Button>
              <Button onClick={() => setOpen(false)}>Install Tonight</Button>
            </>
          }
        >
          <p style={{ color: 'var(--may-color-text-secondary)', marginTop: 0 }}>
            This update introduces Image Playground, adds ChatGPT integration to Siri, and
            includes bug fixes and security improvements for your iPhone.
          </p>
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} style={{ color: 'var(--may-color-text-secondary)' }}>
              Fixes an issue where the Weather widget could fail to refresh in the background,
              resolves a rare condition that prevented AirDrop transfers from completing over
              Wi-Fi, and improves reliability of CarPlay when connecting over USB.
            </p>
          ))}
        </Modal>
      </>
    )
  },
}

/**
 * A decision that has to be made: no close chip, no scrim dismissal, no
 * Escape. The trap keeps the keyboard inside, and clicking the scrim returns
 * focus to the panel rather than dropping it on the page behind.
 */
export const RequiresAChoice: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button tone="danger" onClick={() => setOpen(true)}>
          Erase All Content
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          closeButton={false}
          closeOnScrimClick={false}
          closeOnEscape={false}
          title="Sign in to continue"
          description="Enter your Apple Account password to erase this iPhone."
          footer={
            <>
              <Button variant="gray" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button tone="danger" onClick={() => setOpen(false)}>
                Erase iPhone
              </Button>
            </>
          }
        />
      </>
    )
  },
}
