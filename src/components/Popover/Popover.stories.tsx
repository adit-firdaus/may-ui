import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { Popover } from './Popover'
import type { PopoverPlacement } from './Popover'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { List, ListRow } from '../List'
import { Switch } from '../Switch'

const InfoIcon = () => <IoInformationCircleOutline aria-hidden />

const meta = {
  title: 'Catalog/Adaptive/Popover',
  component: Popover,
  args: {
    trigger: <Button variant="gray">Options</Button>,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The panel grows out of the point on the trigger it is anchored to, springs
 * past its resting size, and settles. Press outside it, press Escape, or tab
 * away to dismiss — Escape hands focus back to the trigger, the other two
 * leave it wherever the user just put it.
 */
export const Default: Story = {
  render: (args) => (
    <Popover {...args} aria-label="Photo details">
      <div style={{ display: 'grid', gap: 'var(--may-space-2)', width: 260 }}>
        <strong style={{ fontSize: 'var(--may-text-headline)' }}>IMG_4021.HEIC</strong>
        <span style={{ color: 'var(--may-color-text-secondary)', fontSize: 'var(--may-text-footnote)' }}>
          Yesterday at 4:31 PM · 3.2 MB · 4032 × 3024
        </span>
        <Button size="sm" variant="tinted" fullWidth>
          Show in Finder
        </Button>
      </div>
    </Popover>
  ),
}

/**
 * A side plus an optional alignment along it. Whatever you ask for is a
 * preference, not a promise: the panel flips to the opposite side when its own
 * side has no room, then shifts along the edge to stay on screen.
 */
export const Placements: Story = {
  render: () => {
    const placements: PopoverPlacement[] = [
      'top-start',
      'top',
      'top-end',
      'left',
      'right',
      'bottom-start',
      'bottom',
      'bottom-end',
    ]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, auto)',
          gap: 'var(--may-space-3)',
          placeItems: 'center',
          padding: 'var(--may-space-16)',
        }}
      >
        {placements.map((placement) => (
          <Popover
            key={placement}
            placement={placement}
            aria-label={placement}
            trigger={<Button variant="gray" size="sm">{placement}</Button>}
          >
            <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--may-text-subheadline)' }}>
              Anchored {placement}
            </span>
          </Popover>
        ))}
      </div>
    )
  },
}

/**
 * `padded={false}` hands the panel's edges to the content, so a grouped list
 * runs to the corners the way an iOS popover presents one. Rows keep their own
 * hairlines and press feedback inside the floating surface.
 */
export const WithList: Story = {
  render: () => {
    const [airdrop, setAirdrop] = useState(true)
    return (
      <Popover
        padded={false}
        placement="bottom-end"
        aria-label="Sharing"
        trigger={
          <IconButton aria-label="Sharing options" variant="gray" round>
            <InfoIcon />
          </IconButton>
        }
      >
        <div style={{ width: 280 }}>
          <List variant="plain">
            <ListRow
              title="AirDrop"
              subtitle="Everyone for 10 minutes"
              accessory={<Switch checked={airdrop} onCheckedChange={setAirdrop} />}
            />
            <ListRow title="Ada's MacBook Pro" detail="Nearby" onClick={() => {}} />
            <ListRow title="Grace's iPhone" detail="Nearby" onClick={() => {}} />
            <ListRow title="Studio Display" onClick={() => {}} />
          </List>
        </div>
      </Popover>
    )
  },
}

/**
 * Controlled, and pinned to the bottom of a scroller. Scroll the box: the panel
 * tracks its trigger, and flips above it once there is no room below.
 */
export const FlipsToFit: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div
        data-slot="scroll-area"
        style={{
          width: 360,
          height: 260,
          overflowY: 'auto',
          borderRadius: 'var(--may-radius-card)',
          background: 'var(--may-color-surface)',
          padding: 'var(--may-space-4)',
        }}
      >
        <p style={{ color: 'var(--may-color-text-secondary)' }}>
          Scroll down to the trigger, open it, then keep scrolling.
        </p>
        <div style={{ height: 200 }} />
        <Popover
          open={open}
          onOpenChange={setOpen}
          placement="bottom"
          aria-label="Storage detail"
          trigger={<Button variant="tinted">iCloud storage</Button>}
        >
          <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--may-text-subheadline)' }}>
            41.2 GB of 200 GB used
          </span>
        </Popover>
        <div style={{ height: 320 }} />
      </div>
    )
  },
}
