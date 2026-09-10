import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AlertDialog } from './AlertDialog'
import { Button } from '../Button'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/AlertDialog',
  component: AlertDialog,
  args: {
    open: false,
    title: 'Are you sure?',
    onConfirm: () => {},
    onCancel: () => {},
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The ordinary confirm. Opens with the confirming action focused, so Return
 * answers it. Click the dimmed background: the alert nudges rather than
 * closing, because "somewhere else" is not one of the two answers.
 */
export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState('Wi-Fi only')
    return (
      <div style={{ display: 'grid', gap: 'var(--may-space-3)', justifyItems: 'center' }}>
        <Button onClick={() => setOpen(true)}>Download over cellular</Button>
        <span style={{ color: 'var(--may-color-text-secondary)' }}>Downloads: {status}</span>
        <AlertDialog
          open={open}
          title="Use Cellular Data?"
          description="This update is 3.1 GB. Downloading it now will use your data allowance."
          confirmLabel="Download"
          cancelLabel="Wi-Fi Only"
          onConfirm={() => {
            setStatus('cellular allowed')
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    )
  },
}

/**
 * The destructive shape. The confirming action turns red and focus opens on
 * Cancel instead — a Return key that arrives before the sentence has been read
 * must not be the one that deletes something.
 */
export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [albums, setAlbums] = useState(['Iceland 2024', 'Screenshots', 'Live Photos'])
    return (
      <div style={{ display: 'grid', gap: 'var(--may-space-4)', width: 320 }}>
        <List header="Albums" footer="Deleting an album keeps its photos in Recents.">
          {albums.map((album) => (
            <ListRow key={album} title={album} detail="211" />
          ))}
        </List>
        <Button tone="danger" variant="tinted" onClick={() => setOpen(true)}>
          Delete "Iceland 2024"
        </Button>
        <AlertDialog
          open={open}
          destructive
          title='Delete "Iceland 2024"?'
          description="The album will be deleted from all your devices. Its 211 photos stay in Recents."
          confirmLabel="Delete Album"
          onConfirm={() => {
            setAlbums((current) => current.filter((a) => a !== 'Iceland 2024'))
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    )
  },
}

/** Title only. Nothing to explain, so nothing is invented to fill the space. */
export const TitleOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="gray" onClick={() => setOpen(true)}>
          Discard draft
        </Button>
        <AlertDialog
          open={open}
          destructive
          title="Discard this draft?"
          confirmLabel="Discard"
          cancelLabel="Keep Editing"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    )
  },
}

/**
 * Long labels are where a stacked action row earns itself. Narrow the viewport
 * below the desktop breakpoint and the two halves become full-width rows, with
 * the confirming action on top.
 */
export const LongLabels: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button tone="danger" onClick={() => setOpen(true)}>
          Erase this iPhone
        </Button>
        <AlertDialog
          open={open}
          destructive
          title="Erase All Content and Settings?"
          description="This erases all media, data and settings on this iPhone. It cannot be undone."
          confirmLabel="Erase iPhone Now"
          cancelLabel="Keep My Content"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    )
  },
}
