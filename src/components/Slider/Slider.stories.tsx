import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IoSunny, IoSunnyOutline, IoVolumeHigh, IoVolumeLow } from 'react-icons/io5'
import { List, ListRow } from '../List'
import { Slider } from '.'

const meta = {
  title: 'Catalog/Adaptive/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** iOS's brightness slider: a small sun at one end, a large one at the other. */
const SunIcon = ({ rays }: { rays: boolean }) =>
  rays ? <IoSunny aria-hidden /> : <IoSunnyOutline aria-hidden />

const SpeakerIcon = ({ loud }: { loud: boolean }) =>
  loud ? <IoVolumeHigh aria-hidden /> : <IoVolumeLow aria-hidden />

/**
 * The thumb is dragged, and the rail can be pressed anywhere to jump to that
 * point. Holding the thumb swells it — that growth is the press feedback,
 * inverted from every other control in the system because a knob under a
 * finger should rise toward it, not sink away.
 */
export const Brightness: Story = {
  render: () => {
    const [value, setValue] = useState(72)
    return (
      <div style={{ maxWidth: 420 }}>
        <Slider
          aria-label="Brightness"
          value={value}
          onValueChange={setValue}
          leading={<SunIcon rays={false} />}
          trailing={<SunIcon rays />}
        />
      </div>
    )
  },
}

/** `showValue` prints the formatted value, and takes full contrast while dragging. */
export const Volume: Story = {
  render: () => {
    const [value, setValue] = useState(35)
    return (
      <div style={{ maxWidth: 420 }}>
        <Slider
          aria-label="Ringer and alerts"
          value={value}
          onValueChange={setValue}
          showValue
          formatValue={(v) => `${v}%`}
          leading={<SpeakerIcon loud={false} />}
          trailing={<SpeakerIcon loud />}
        />
      </div>
    )
  },
}

/**
 * A stepped slider, as Accessibility ▸ Display ▸ Text Size draws it. The ticks
 * sit under the fill so they read as notches in the unfilled rail and
 * disappear as the tint passes over them.
 */
export const TextSize: Story = {
  render: () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    const [value, setValue] = useState(3)
    return (
      <div style={{ maxWidth: 420 }}>
        <Slider
          aria-label="Text size"
          min={0}
          max={6}
          step={1}
          ticks
          value={value}
          onValueChange={setValue}
          showValue
          formatValue={(v) => sizes[v] ?? ''}
        />
      </div>
    )
  },
}

/** The filled portion carries the tone; the rail stays a neutral fill. */
export const Tones: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-5)',
        maxWidth: 420,
      }}
    >
      <Slider aria-label="Storage used" defaultValue={64} />
      <Slider aria-label="Battery" tone="success" defaultValue={88} />
      <Slider aria-label="Low power threshold" tone="warning" defaultValue={20} />
      <Slider aria-label="Recording level" tone="danger" defaultValue={94} />
      <Slider aria-label="Locked" defaultValue={40} disabled />
    </div>
  ),
}

/** Full-width inside a grouped card, the way Settings lays a slider out. */
export const InSettings: Story = {
  render: () => {
    const [brightness, setBrightness] = useState(64)
    return (
      <div style={{ maxWidth: 480 }}>
        <List header="Display & Brightness" footer="True Tone adjusts the display to match ambient light.">
          <div style={{ padding: 'var(--may-space-3) var(--may-space-4)' }}>
            <Slider
              aria-label="Brightness"
              value={brightness}
              onValueChange={setBrightness}
              leading={<SunIcon rays={false} />}
              trailing={<SunIcon rays />}
            />
          </div>
          <ListRow title="True Tone" detail="On" onClick={() => {}} />
          <ListRow title="Night Shift" detail="10:00 PM to 7:00 AM" onClick={() => {}} />
        </List>
      </div>
    )
  },
}
