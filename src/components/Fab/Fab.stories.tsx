import type { Meta, StoryObj } from '@storybook/react'
import { IoAdd, IoCreate } from 'react-icons/io5'
import { Fab } from './Fab'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Fab',
  component: Fab,
  args: { 'aria-label': 'New note', icon: <IoCreate aria-hidden focusable="false" /> },
  argTypes: {
    tone: { control: 'select', options: ['tint', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    position: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Fab>

export default meta
type Story = StoryObj<typeof meta>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--may-space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
)

/** Press and hold: the scale and the shadow contract together, then spring back. */
export const Default: Story = {}

/** A label extends the circle into a pill, for when the glyph alone is ambiguous. */
export const Extended: Story = {
  render: (args) => (
    <Row>
      <Fab {...args} />
      <Fab {...args}>New Note</Fab>
      <Fab {...args} icon={<IoAdd aria-hidden focusable="false" />} aria-label="Add reminder" tone="danger">
        Remind Me
      </Fab>
    </Row>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Row>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Fab {...args} key={s} size={s} />
      ))}
    </Row>
  ),
}

export const Tones: Story = {
  render: (args) => (
    <Row>
      {(['tint', 'neutral', 'success', 'warning', 'danger'] as const).map((t) => (
        <Fab {...args} key={t} tone={t} aria-label={`New ${t} note`} />
      ))}
    </Row>
  ),
}

/**
 * Anchored over a list, the way Notes floats its compose button. The FAB is not
 * `fixed` here so it stays inside the pane rather than the Storybook viewport —
 * `fixed` adds the safe-area insets that keep it off the home indicator.
 */
export const OverContent: Story = {
  render: (args) => (
    <div
      style={{
        position: 'relative',
        width: 380,
        height: 300,
        overflow: 'hidden',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-bg)',
        boxShadow: 'var(--may-shadow-md)',
      }}
    >
      <div data-slot="scroll-area" style={{ height: '100%', overflowY: 'auto', padding: 'var(--may-space-4)' }}>
        <List variant="inset">
          <ListRow title="Packing list" subtitle="Yesterday · 4 items" onClick={() => {}} />
          <ListRow title="Kyoto itinerary" subtitle="Monday · Nishiki, Fushimi Inari" onClick={() => {}} />
          <ListRow title="Standup notes" subtitle="Monday · Shipping estimates" onClick={() => {}} />
          <ListRow title="Book recommendations" subtitle="12 Aug" onClick={() => {}} />
          <ListRow title="Rent renewal" subtitle="4 Aug" onClick={() => {}} />
        </List>
      </div>
      <Fab
        {...args}
        style={{
          position: 'absolute',
          insetInlineEnd: 'var(--may-space-5)',
          insetBlockEnd: 'var(--may-space-5)',
        }}
      />
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <Row>
      <Fab {...args} />
      <Fab {...args} loading aria-label="Saving note" />
      <Fab {...args} disabled aria-label="New note unavailable" />
    </Row>
  ),
}

