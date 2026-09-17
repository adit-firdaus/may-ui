import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Sheet } from '.'
import { Button } from '../Button'
import { List, ListRow } from '../List'
import { Popover } from '../Popover'

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

/**
 * A Popover raised from inside a Sheet — the case that used to close both.
 *
 * Sheet and Popover each registered a CAPTURE-phase `keydown` on `document`.
 * Listeners on the same node fire in registration order, and `stopPropagation`
 * does not suppress a sibling on that node, so the Sheet — having opened first
 * — always heard Escape first and took itself down along with the popover.
 *
 * Press Escape with the popover open: the popover closes, the sheet stays.
 * Press it again and the sheet closes. Dismissal unwinds one layer at a time.
 */
export const NestedDismissal: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet open={open} onClose={() => setOpen(false)} title="Nested dismissal">
          <List>
            <ListRow title="Escape closes the popover first" />
            <ListRow title="Escape again closes the sheet" />
          </List>
          <Popover
            placement="top"
            trigger={
              <Button data-testid="open-popover" variant="tinted">
                Open popover
              </Button>
            }
          >
            <Button data-testid="inside-popover" size="sm">
              Inside the popover
            </Button>
          </Popover>
        </Sheet>
      </>
    )
  },
}


/** Zero state: the sheet owns its open flag and the trigger flips it. */
export const Uncontrolled: Story = {
  render: () => (
    <Sheet trigger={<Button data-testid="sheet-trigger">Open sheet</Button>} title="Uncontrolled">
      <List>
        <ListRow title="No useState in this story" />
      </List>
    </Sheet>
  ),
}
