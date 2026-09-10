import type { Meta, StoryObj } from '@storybook/react'
import {
  IoFlame,
  IoFlash,
  IoFootsteps,
  IoHeart,
  IoMoon,
} from 'react-icons/io5'
import { useState } from 'react'
import { Statistic } from './Statistic'
import { IconTile } from '../IconTile/IconTile'
import { Button } from '../Button/Button'

const meta = {
  title: 'Catalog/Adaptive/Statistic',
  component: Statistic,
  args: {
    label: 'Move',
    value: '1,284',
    unit: 'kcal',
    delta: '12%',
    direction: 'up',
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['up', 'down', 'flat'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['plain', 'card'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Statistic>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The Health / Fitness shape: a grid of tiles, each with its category icon. */
export const Dashboard: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--may-space-3)',
        maxWidth: 720,
      }}
    >
      <Statistic
        variant="card"
        label="Move"
        value="1,284"
        unit="kcal"
        delta="12%"
        direction="up"
        trailing={
          <IconTile gradient="red" size="md">
            <IoFlame aria-hidden />
          </IconTile>
        }
      />
      <Statistic
        variant="card"
        label="Steps"
        value="9,412"
        delta="4%"
        direction="down"
        trailing={
          <IconTile gradient="orange" size="md">
            <IoFootsteps aria-hidden />
          </IconTile>
        }
      />
      <Statistic
        variant="card"
        label="Resting Heart Rate"
        value="54"
        unit="bpm"
        delta="3 bpm"
        direction="down"
        invertDelta
        trailing={
          <IconTile gradient="pink" size="md">
            <IoHeart aria-hidden />
          </IconTile>
        }
      />
      <Statistic
        variant="card"
        label="Time Asleep"
        value="7:12"
        delta="Unchanged"
        direction="flat"
        trailing={
          <IconTile gradient="indigo" size="md">
            <IoMoon aria-hidden />
          </IconTile>
        }
      />
    </div>
  ),
}

/**
 * Colour tracks whether the metric got *better*, not which way it moved:
 * resting heart rate falling is green, and so is availability rising.
 */
export const Direction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--may-space-8)', flexWrap: 'wrap' }}>
      <Statistic label="Uptime" value="99.98" unit="%" delta="0.02%" direction="up" />
      <Statistic label="Errors" value="128" delta="46%" direction="up" invertDelta />
      <Statistic label="p95 Latency" value="212" unit="ms" delta="31 ms" direction="down" invertDelta />
      <Statistic label="Subscribers" value="4,061" delta="No change" direction="flat" />
    </div>
  ),
}

/** The arrow turns on the same spring every press in the system rides. */
export const Turning: Story = {
  render: () => <TurnDemo />,
}

function TurnDemo() {
  const [up, setUp] = useState(true)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-6)' }}>
      <Statistic
        variant="card"
        label="Battery Health"
        value={up ? '98' : '91'}
        unit="%"
        delta={up ? '2%' : '7%'}
        direction={up ? 'up' : 'down'}
        trailing={
          <IconTile gradient="green" size="md">
            <IoFlash aria-hidden />
          </IconTile>
        }
      />
      <Button variant="gray" size="sm" onClick={() => setUp((v) => !v)}>
        Flip the trend
      </Button>
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--may-space-8)' }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Statistic key={s} size={s} label="Downloads" value="24,918" delta="8%" direction="up" />
      ))}
    </div>
  ),
}
