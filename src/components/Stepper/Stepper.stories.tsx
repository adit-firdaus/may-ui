import type { Meta, StoryObj } from '@storybook/react'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { List, ListRow } from '../List'
import { Stepper } from '.'

const meta = {
  title: 'Catalog/Adaptive/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

const readout: CSSProperties = {
  minWidth: '3ch',
  fontSize: 'var(--may-text-body)',
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--may-color-text-secondary)',
}

/**
 * Hold either half down: after a beat it starts repeating, and every repeat is
 * a little quicker than the last. Reaching 40 is a press, not forty taps.
 */
export const Default: Story = {
  render: () => {
    const [count, setCount] = useState(2)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-4)' }}>
        <Stepper aria-label="Guests" min={1} max={99} value={count} onValueChange={setCount} />
        <span style={readout}>{count} guests</span>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-5)' }}>
      <Stepper aria-label="Small" size="sm" defaultValue={1} />
      <Stepper aria-label="Medium" size="md" defaultValue={1} />
      <Stepper aria-label="Large" size="lg" defaultValue={1} />
    </div>
  ),
}

/**
 * At a limit that half dims and stops responding — including mid-hold, which
 * cancels the repeat rather than letting it tick against the boundary.
 */
export const Limits: Story = {
  render: () => {
    const [minutes, setMinutes] = useState(15)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--may-space-4)' }}>
        <Stepper
          aria-label="Snooze"
          min={5}
          max={30}
          step={5}
          value={minutes}
          onValueChange={setMinutes}
          formatValue={(v) => `${v} minutes`}
        />
        <span style={readout}>{minutes} min</span>
      </div>
    )
  },
}

/** Where a stepper actually lives: trailing a grouped row, with the value beside it. */
export const InSettings: Story = {
  render: () => {
    const [servings, setServings] = useState(4)
    const [rings, setRings] = useState(3)

    return (
      <div style={{ maxWidth: 480 }}>
        <List header="Timer" footer="Repeats stop as soon as a limit is reached.">
          <ListRow
            title="Servings"
            detail={String(servings)}
            accessory={
              <Stepper
                aria-label="Servings"
                size="sm"
                min={1}
                max={12}
                value={servings}
                onValueChange={setServings}
              />
            }
          />
          <ListRow
            title="Repeat alert"
            subtitle="Rings before giving up"
            detail={String(rings)}
            accessory={
              <Stepper
                aria-label="Repeat alert"
                size="sm"
                min={0}
                max={10}
                value={rings}
                onValueChange={setRings}
              />
            }
          />
          <ListRow title="Sound" detail="Radar" onClick={() => {}} />
        </List>
      </div>
    )
  },
}
