import type { Meta, StoryObj } from '@storybook/react'
import { IconTile } from './IconTile'
import type { IconTileGradient } from './IconTile'
import { List, ListRow } from '../List/List'

const meta = {
  title: 'Catalog/Adaptive/IconTile',
  component: IconTile,
  args: { gradient: 'blue', children: <WifiIcon /> },
  argTypes: {
    gradient: {
      control: 'select',
      options: [
        'blue',
        'green',
        'red',
        'orange',
        'yellow',
        'purple',
        'pink',
        'teal',
        'indigo',
        'gray',
        'spectrum',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconTile>

export default meta
type Story = StoryObj<typeof meta>

const GRADIENTS: IconTileGradient[] = [
  'blue',
  'green',
  'red',
  'orange',
  'yellow',
  'purple',
  'pink',
  'teal',
  'indigo',
  'gray',
  'spectrum',
]

export const Default: Story = {}

/** All eleven gradient tokens. No shadows — the gradient carries the depth. */
export const Gradients: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-3)', flexWrap: 'wrap' }}>
      {GRADIENTS.map((g) => (
        <IconTile key={g} gradient={g} size="lg" label={g}>
          <StarIcon />
        </IconTile>
      ))}
    </div>
  ),
}

/** `sm` is the 29pt Settings row icon; `lg` is the 60pt home-screen icon. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-4)', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <IconTile key={s} size={s} gradient="indigo" label={`Size ${s}`}>
          <BellIcon />
        </IconTile>
      ))}
      {/* A text glyph scales with the tile the same way a symbol does. */}
      <IconTile size="lg" gradient="spectrum" label="Photos">
        A
      </IconTile>
    </div>
  ),
}

/** The job it was built for: the leading element of a grouped Settings list. */
export const InSettings: Story = {
  render: () => (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <List header="Network">
        <ListRow
          leading={<IconTile gradient="blue"><WifiIcon /></IconTile>}
          title="Wi-Fi"
          detail="HomeNet"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="teal"><BluetoothIcon /></IconTile>}
          title="Bluetooth"
          detail="On"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="green"><CellularIcon /></IconTile>}
          title="Cellular"
          onClick={() => {}}
        />
      </List>

      <List header="Alerts" footer="Sounds and haptics follow the Focus that is running.">
        <ListRow
          leading={<IconTile gradient="red"><BellIcon /></IconTile>}
          title="Notifications"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="purple"><MoonIcon /></IconTile>}
          title="Focus"
          detail="Work"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="gray"><LockIcon /></IconTile>}
          title="Screen Time"
          onClick={() => {}}
        />
      </List>
    </div>
  ),
}

/** At `lg` with a caption underneath it is a home-screen icon. */
export const HomeScreen: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 'var(--may-space-5)',
        maxWidth: 360,
      }}
    >
      {[
        { name: 'Weather', gradient: 'blue' as const, icon: <SunIcon /> },
        { name: 'Health', gradient: 'pink' as const, icon: <HeartIcon /> },
        { name: 'Notes', gradient: 'yellow' as const, icon: <NoteIcon /> },
        { name: 'Photos', gradient: 'spectrum' as const, icon: <StarIcon /> },
        { name: 'Podcasts', gradient: 'purple' as const, icon: <BellIcon /> },
        { name: 'Maps', gradient: 'green' as const, icon: <MapIcon /> },
        { name: 'Clock', gradient: 'gray' as const, icon: <ClockIcon /> },
        { name: 'Alerts', gradient: 'red' as const, icon: <BellIcon /> },
      ].map((app) => (
        <div
          key={app.name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--may-space-2)',
          }}
        >
          <IconTile size="lg" gradient={app.gradient} label={app.name}>
            {app.icon}
          </IconTile>
          <span
            style={{
              fontSize: 'var(--may-text-caption-1)',
              lineHeight: 'var(--may-text-caption-1-leading)',
              color: 'var(--may-color-text-secondary)',
            }}
          >
            {app.name}
          </span>
        </div>
      ))}
    </div>
  ),
}

/* ------------------------------- glyph set -------------------------------- */

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 9.5c5-4.3 13-4.3 18 0M6.4 13.4c3.2-2.7 8-2.7 11.2 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="1.7" fill="currentColor" />
    </svg>
  )
}

function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8 7.5L16 16.5L12 20V4l4 3.5L8 16.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CellularIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="14" width="3.4" height="6" rx="1.2" fill="currentColor" />
      <rect x="8.6" y="10" width="3.4" height="10" rx="1.2" fill="currentColor" />
      <rect x="14.2" y="6" width="3.4" height="14" rx="1.2" fill="currentColor" />
      <rect x="19.8" y="3" width="1.2" height="17" rx="0.6" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3a5.6 5.6 0 00-5.6 5.6v3.6L4.8 16h14.4l-1.6-3.8V8.6A5.6 5.6 0 0012 3z"
        fill="currentColor"
      />
      <path d="M9.8 18a2.2 2.2 0 004.4 0z" fill="currentColor" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" />
      <path
        d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      <path
        d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20.4S3.4 15.2 3.4 9.4A4.8 4.8 0 0112 6.8a4.8 4.8 0 018.6 2.6c0 5.8-8.6 11-8.6 11z"
        fill="currentColor"
      />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="4.5" y="3.5" width="15" height="17" rx="3" fill="currentColor" opacity="0.9" />
      <path
        d="M8 8.5h8M8 12h8M8 15.5h5"
        stroke="var(--may-color-surface)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3.6 6.4L9 4.2v13.4l-5.4 2.2z" fill="currentColor" opacity="0.75" />
      <path d="M9 4.2l6 2.2v13.4L9 17.6z" fill="currentColor" />
      <path d="M15 6.4l5.4-2.2v13.4L15 19.8z" fill="currentColor" opacity="0.75" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 7.4V12l3.2 2.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.4l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.8z"
        fill="currentColor"
      />
    </svg>
  )
}
