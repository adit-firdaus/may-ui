import type { Meta, StoryObj } from '@storybook/react'
import {
  IoBluetooth,
  IoCellular,
  IoDocumentText,
  IoHeart,
  IoLockClosed,
  IoMap,
  IoMoon,
  IoNotifications,
  IoStar,
  IoSunny,
  IoTime,
  IoWifi,
} from 'react-icons/io5'
import { IconTile } from './IconTile'
import type { IconTileGradient } from './IconTile'
import { List, ListRow } from '../List/List'

const meta = {
  title: 'Catalog/Adaptive/IconTile',
  component: IconTile,
  args: { gradient: 'blue', children: <IoWifi aria-hidden /> },
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
          <IoStar aria-hidden />
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
          <IoNotifications aria-hidden />
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
          leading={<IconTile gradient="blue"><IoWifi aria-hidden /></IconTile>}
          title="Wi-Fi"
          detail="HomeNet"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="teal"><IoBluetooth aria-hidden /></IconTile>}
          title="Bluetooth"
          detail="On"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="green"><IoCellular aria-hidden /></IconTile>}
          title="Cellular"
          onClick={() => {}}
        />
      </List>

      <List header="Alerts" footer="Sounds and haptics follow the Focus that is running.">
        <ListRow
          leading={<IconTile gradient="red"><IoNotifications aria-hidden /></IconTile>}
          title="Notifications"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="purple"><IoMoon aria-hidden /></IconTile>}
          title="Focus"
          detail="Work"
          onClick={() => {}}
        />
        <ListRow
          leading={<IconTile gradient="gray"><IoLockClosed aria-hidden /></IconTile>}
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
        { name: 'Weather', gradient: 'blue' as const, icon: <IoSunny aria-hidden /> },
        { name: 'Health', gradient: 'pink' as const, icon: <IoHeart aria-hidden /> },
        { name: 'Notes', gradient: 'yellow' as const, icon: <IoDocumentText aria-hidden /> },
        { name: 'Photos', gradient: 'spectrum' as const, icon: <IoStar aria-hidden /> },
        { name: 'Podcasts', gradient: 'purple' as const, icon: <IoNotifications aria-hidden /> },
        { name: 'Maps', gradient: 'green' as const, icon: <IoMap aria-hidden /> },
        { name: 'Clock', gradient: 'gray' as const, icon: <IoTime aria-hidden /> },
        { name: 'Alerts', gradient: 'red' as const, icon: <IoNotifications aria-hidden /> },
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
