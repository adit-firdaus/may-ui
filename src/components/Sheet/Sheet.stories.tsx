import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Sheet } from './Sheet'
import { Button } from '../Button'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Sheet',
  component: Sheet,
  args: { open: false, onClose: () => {} },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * One component, two shapes. Below the desktop breakpoint it rises from the
 * bottom edge with a grabber and drag-to-dismiss; above it, it presents as a
 * centred dialog. Narrow the viewport to switch, then drag the sheet down.
 */
export const Adaptive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          title="AirDrop"
          description="Share with people nearby."
          footer={
            <>
              <Button variant="plain" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Share</Button>
            </>
          }
        >
          <List>
            <ListRow title="Ada's MacBook Pro" detail="Nearby" onClick={() => {}} />
            <ListRow title="Grace's iPhone" detail="Nearby" onClick={() => {}} />
            <ListRow title="Studio Display" onClick={() => {}} />
          </List>
        </Sheet>
      </>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full' | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--may-space-2)' }}>
          {(['sm', 'md', 'lg', 'full'] as const).map((s) => (
            <Button key={s} variant="gray" onClick={() => setSize(s)}>{s}</Button>
          ))}
        </div>
        <Sheet
          open={size !== null}
          onClose={() => setSize(null)}
          size={size ?? 'md'}
          title={`Size "${size}"`}
          footer={<Button onClick={() => setSize(null)}>Done</Button>}
        >
          <p style={{ color: 'var(--may-color-text-secondary)' }}>
            On a phone this caps the sheet's height. On desktop it caps the dialog's width.
          </p>
        </Sheet>
      </>
    )
  },
}

/** Dismissal can be turned off for a sheet that requires a decision. */
export const NotDismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button tone="danger" onClick={() => setOpen(true)}>Delete account</Button>
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          dismissible={false}
          closeOnScrimClick={false}
          size="sm"
          title="Delete account?"
          description="This removes everything and cannot be undone."
          footer={
            <>
              <Button variant="gray" onClick={() => setOpen(false)}>Cancel</Button>
              <Button tone="danger" onClick={() => setOpen(false)}>Delete</Button>
            </>
          }
        />
      </>
    )
  },
}
