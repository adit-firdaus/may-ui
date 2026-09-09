import type { Meta, StoryObj } from '@storybook/react'
import { List, ListRow } from './List'

const meta = {
  title: 'Catalog/Adaptive/List',
  component: List,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

function Tile({ gradient }: { gradient: string }) {
  return (
    <span
      style={{
        display: 'block',
        width: 29,
        height: 29,
        borderRadius: 'var(--may-radius-squircle)',
        background: `var(--may-grad-${gradient})`,
      }}
    />
  )
}

/**
 * The iOS Settings shape: rows share one rounded card, separated by hairlines
 * that start under the label rather than at the card's edge.
 */
export const Settings: Story = {
  render: () => (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
      <List header="Network">
        <ListRow leading={<Tile gradient="blue" />} title="Wi-Fi" detail="HomeNet" onClick={() => {}} />
        <ListRow leading={<Tile gradient="green" />} title="Cellular" detail="Off" onClick={() => {}} />
        <ListRow leading={<Tile gradient="indigo" />} title="Personal Hotspot" onClick={() => {}} />
      </List>

      <List header="General" footer="Updates download automatically over Wi-Fi.">
        <ListRow leading={<Tile gradient="gray" />} title="About" onClick={() => {}} />
        <ListRow
          leading={<Tile gradient="orange" />}
          title="Software Update"
          subtitle="1 update available"
          onClick={() => {}}
        />
        <ListRow leading={<Tile gradient="red" />} title="Reset" destructive onClick={() => {}} />
      </List>
    </div>
  ),
}

/** Rows without `onClick` are static and render as divs, not buttons. */
export const StaticRows: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <List header="Device">
        <ListRow title="Model" detail="A2650" />
        <ListRow title="Serial Number" detail="F2LW48ZXQ1" />
        <ListRow title="Capacity" detail="256 GB" />
      </List>
    </div>
  ),
}

export const Plain: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <List variant="plain">
        <ListRow title="Edge to edge" subtitle="No card, no rounding" onClick={() => {}} />
        <ListRow title="Second row" onClick={() => {}} />
      </List>
    </div>
  ),
}
