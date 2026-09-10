import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { List, ListRow } from '../../components/List'
import { Popup } from './Popup'

const meta = {
  title: 'Catalog/Mobile/Popup',
  component: Popup,
  args: { visible: false, onClose: () => {} },
  argTypes: {
    position: { control: 'inline-radio', options: ['bottom', 'top'] },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Popup>

export default meta
type Story = StoryObj<typeof meta>

/* The page a popup is presented over. Without something behind it there is no
 * way to see that the mask darkens the layer below rather than replacing it. */
function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '30rem',
        padding: 'var(--may-space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-4)',
        background: 'var(--may-color-bg)',
      }}
    >
      {children}
    </div>
  )
}

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const icons = {
  airdrop: 'M8 14a3.5 3.5 0 0 0 0-7 3.5 3.5 0 0 0 0 7zM3.2 9.5A6 6 0 0 1 8 2a6 6 0 0 1 4.8 7.5M5.4 10.6A3.4 3.4 0 0 1 8 5.2c1.2 0 2.2.6 2.8 1.6',
  copy: 'M5.5 5.5V3.2A1.2 1.2 0 0 1 6.7 2h6.1A1.2 1.2 0 0 1 14 3.2v6.1a1.2 1.2 0 0 1-1.2 1.2h-2.3M3.2 5.5h6.1A1.2 1.2 0 0 1 10.5 6.7v6.1A1.2 1.2 0 0 1 9.3 14H3.2A1.2 1.2 0 0 1 2 12.8V6.7a1.2 1.2 0 0 1 1.2-1.2z',
  bookmark: 'M4 2.5h8v11l-4-3-4 3z',
  print: 'M4.5 6V2.5h7V6M4.5 11.5H3.2A1.2 1.2 0 0 1 2 10.3V7.2A1.2 1.2 0 0 1 3.2 6h9.6A1.2 1.2 0 0 1 14 7.2v3.1a1.2 1.2 0 0 1-1.2 1.2h-1.3M4.5 9.5h7v4h-7z',
}

/** A share sheet — the canonical thing a phone raises from the bottom edge. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Screen>
        <Button onClick={() => setOpen(true)}>Share</Button>
        <Popup visible={open} onClose={() => setOpen(false)} title="Share Link">
          <List variant="plain">
            <ListRow title="AirDrop" leading={<Glyph d={icons.airdrop} />} onClick={() => setOpen(false)} />
            <ListRow title="Copy" leading={<Glyph d={icons.copy} />} onClick={() => setOpen(false)} />
            <ListRow title="Add to Reading List" leading={<Glyph d={icons.bookmark} />} onClick={() => setOpen(false)} />
            <ListRow title="Print" leading={<Glyph d={icons.print} />} onClick={() => setOpen(false)} />
          </List>
        </Popup>
      </Screen>
    )
  },
}

/**
 * A top popup is a banner, not a sheet — so it drops the grabber and the drag
 * with it. Pulling *down* on a panel attached to the top edge would drag it
 * further into the screen, which is why the affordance is not offered.
 */
export const Positions: Story = {
  render: () => {
    const [side, setSide] = useState<'bottom' | 'top' | null>(null)
    return (
      <Screen>
        <Button onClick={() => setSide('bottom')}>From the bottom</Button>
        <Button variant="gray" onClick={() => setSide('top')}>
          From the top
        </Button>
        <Popup
          visible={side !== null}
          onClose={() => setSide(null)}
          position={side ?? 'bottom'}
          title={side === 'top' ? 'Focus Mode On' : 'Playback Speed'}
          padded
        >
          <p style={{ margin: 0, color: 'var(--may-color-text-secondary)' }}>
            {side === 'top'
              ? 'Notifications are silenced until 9:00 AM. Time Sensitive alerts still come through.'
              : 'Podcasts remembers this setting for every episode in the show.'}
          </p>
        </Popup>
      </Screen>
    )
  },
}

/** `height` takes any CSS length. Content past it scrolls inside the panel. */
export const FixedHeight: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const timeZones = [
      ['Cupertino', '9:41 AM'],
      ['New York', '12:41 PM'],
      ['London', '5:41 PM'],
      ['Paris', '6:41 PM'],
      ['Lagos', '6:41 PM'],
      ['Dubai', '8:41 PM'],
      ['Bengaluru', '10:11 PM'],
      ['Singapore', '12:41 AM'],
      ['Tokyo', '1:41 AM'],
      ['Sydney', '3:41 AM'],
    ]
    return (
      <Screen>
        <Button onClick={() => setOpen(true)}>Choose a city</Button>
        <Popup visible={open} onClose={() => setOpen(false)} title="World Clock" height="70%">
          <List variant="plain">
            {timeZones.map(([city, time]) => (
              <ListRow key={city} title={city} detail={time} onClick={() => setOpen(false)} />
            ))}
          </List>
        </Popup>
      </Screen>
    )
  },
}

/**
 * A decision, not a menu. The mask is inert and there is no grabber, so the
 * only ways out are the two buttons — the shape to reach for when dismissing
 * by accident would lose work.
 */
export const Committed: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Screen>
        <Button tone="danger" onClick={() => setOpen(true)}>
          Discard Draft
        </Button>
        <Popup
          visible={open}
          onClose={() => setOpen(false)}
          closeOnMaskClick={false}
          grabber={false}
          title="Discard this draft?"
          padded
        >
          <p style={{ margin: '0 0 var(--may-space-5)', color: 'var(--may-color-text-secondary)' }}>
            You have unsent changes to “Re: Q3 planning”. Discarding cannot be undone.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)' }}>
            <Button tone="danger" fullWidth size="lg" onClick={() => setOpen(false)}>
              Discard Draft
            </Button>
            <Button variant="gray" fullWidth size="lg" onClick={() => setOpen(false)}>
              Keep Editing
            </Button>
          </div>
        </Popup>
      </Screen>
    )
  },
}
