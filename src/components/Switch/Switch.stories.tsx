import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Switch } from '.'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Switch',
  component: Switch,
  args: { children: 'Airplane Mode' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    labelPosition: { control: 'inline-radio', options: ['start', 'end'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Tap it and watch the thumb: it runs past its end position and settles back,
 * and it widens while your finger is down. You can also **drag** the thumb
 * across — the track fills as it travels, and a flick commits from halfway.
 */
export const Default: Story = {
  render: (args) => {
    const [on, setOn] = useState(true)
    return (
      <div style={{ maxWidth: 360 }}>
        <Switch {...args} checked={on} onCheckedChange={setOn} />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-2)',
        maxWidth: 360,
      }}
    >
      <Switch {...args} size="sm" defaultChecked>
        Small
      </Switch>
      <Switch {...args} size="md" defaultChecked>
        Medium
      </Switch>
      <Switch {...args} size="lg" defaultChecked>
        Large
      </Switch>
    </div>
  ),
}

/** The label leads by default, the way Settings reads; `end` flips it. */
export const LabelPosition: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: 360 }}
    >
      <Switch defaultChecked description="Turns off Wi-Fi, cellular and Bluetooth.">
        Airplane Mode
      </Switch>
      <Switch labelPosition="end" description="Ask before joining an unknown network.">
        Ask to Join Networks
      </Switch>
    </div>
  ),
}

/** Trailing a grouped row — the switch's home turf. */
export const InSettings: Story = {
  render: () => {
    const [state, setState] = useState({ airplane: false, wifi: true, hotspot: false })
    return (
      <div style={{ maxWidth: 420 }}>
        <List header="Connections" footer="Personal Hotspot needs cellular data turned on.">
          <ListRow
            title="Airplane Mode"
            accessory={
              <Switch
                aria-label="Airplane Mode"
                checked={state.airplane}
                onCheckedChange={(v) => setState((s) => ({ ...s, airplane: v }))}
              />
            }
          />
          <ListRow
            title="Wi-Fi"
            subtitle="HomeNet 5G"
            accessory={
              <Switch
                aria-label="Wi-Fi"
                checked={state.wifi}
                onCheckedChange={(v) => setState((s) => ({ ...s, wifi: v }))}
              />
            }
          />
          <ListRow
            title="Personal Hotspot"
            accessory={
              <Switch
                aria-label="Personal Hotspot"
                disabled={state.airplane}
                checked={state.hotspot}
                onCheckedChange={(v) => setState((s) => ({ ...s, hotspot: v }))}
              />
            }
          />
        </List>
      </div>
    )
  },
}

export const States: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-2)', maxWidth: 360 }}
    >
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled, off</Switch>
      <Switch disabled defaultChecked>
        Disabled, on
      </Switch>
    </div>
  ),
}
