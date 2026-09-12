import type { Meta, StoryObj } from '@storybook/react'
import {
  IoArrowRedoOutline,
  IoArrowUndoOutline,
  IoCreateOutline,
  IoFolderOutline,
  IoShareOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import { Toolbar, ToolbarSpacer } from '.'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Toolbar',
  component: Toolbar,
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
    variant: { control: 'inline-radio', options: ['plain', 'surface'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

const Pane = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: 380,
      borderRadius: 'var(--may-radius-card)',
      overflow: 'hidden',
      background: 'var(--may-color-bg)',
      boxShadow: 'var(--may-shadow-md)',
    }}
  >
    {children}
  </div>
)

/** The Mail message bar: icon actions spread across the foot of a pane. */
export const MessageActions: Story = {
  render: (args) => (
    <Pane>
      <div style={{ padding: 'var(--may-space-5)', background: 'var(--may-color-surface)' }}>
        <p style={{ margin: 0, fontWeight: 'var(--may-text-headline-weight)' }}>Q3 shipping estimates</p>
        <p style={{ margin: 'var(--may-space-1) 0 0', color: 'var(--may-color-text-secondary)' }}>
          Numbers attached. The Kyoto line slips a week — everything else holds.
        </p>
      </div>
      <Toolbar {...args} separator variant="surface" aria-label="Message actions">
        <IconButton aria-label="Move to folder"><IoFolderOutline aria-hidden /></IconButton>
        <IconButton aria-label="Delete message" tone="danger"><IoTrashOutline aria-hidden /></IconButton>
        <IconButton aria-label="Reply"><IoArrowUndoOutline aria-hidden /></IconButton>
        <IconButton aria-label="Forward"><IoArrowRedoOutline aria-hidden /></IconButton>
        <IconButton aria-label="New message"><IoCreateOutline aria-hidden /></IconButton>
      </Toolbar>
    </Pane>
  ),
}

/**
 * `ToolbarSpacer` pushes what follows it to the far edge, the way a UIKit
 * toolbar is laid out — better than `align` whenever the split is uneven.
 */
export const WithSpacer: Story = {
  render: (args) => (
    <Pane>
      <div style={{ padding: 'var(--may-space-8) var(--may-space-5)', color: 'var(--may-color-text-secondary)' }}>
        3 photos selected
      </div>
      <Toolbar {...args} variant="surface" separator aria-label="Photo actions">
        <Button variant="plain">Select All</Button>
        <ToolbarSpacer />
        <IconButton aria-label="Share"><IoShareOutline aria-hidden /></IconButton>
        <IconButton aria-label="Delete" tone="danger"><IoTrashOutline aria-hidden /></IconButton>
      </Toolbar>
    </Pane>
  ),
}

/** A sheet footer: plain, so it sits on the sheet's own surface rather than repainting it. */
export const SheetFooter: Story = {
  render: (args) => (
    <div
      style={{
        width: 380,
        borderRadius: 'var(--may-radius-sheet)',
        overflow: 'hidden',
        background: 'var(--may-color-surface)',
        boxShadow: 'var(--may-shadow-lg)',
      }}
    >
      <div style={{ padding: 'var(--may-space-5) var(--may-space-5) var(--may-space-3)' }}>
        <p style={{ margin: 0, fontSize: 'var(--may-text-title-3)', fontWeight: 'var(--may-text-title-3-weight)' }}>
          AirDrop
        </p>
      </div>
      <div style={{ padding: '0 var(--may-space-4)' }}>
        <List variant="plain">
          <ListRow title="Ada’s MacBook Pro" detail="Nearby" onClick={() => {}} />
          <ListRow title="Grace’s iPhone" detail="Nearby" onClick={() => {}} />
        </List>
      </div>
      <Toolbar {...args} align="end" aria-label="Share actions">
        <Button variant="plain">Cancel</Button>
        <Button>Share</Button>
      </Toolbar>
    </div>
  ),
}

/** Sticky at the top of a pane. It paints a surface because content scrolls beneath it. */
export const StickyTop: Story = {
  render: (args) => (
    <Pane>
      <div data-slot="scroll-area" style={{ height: 260, overflowY: 'auto' }}>
        <Toolbar {...args} placement="top" sticky separator align="between" aria-label="Album">
          <Button variant="plain" size="sm">Albums</Button>
          <span style={{ fontWeight: 'var(--may-text-headline-weight)' }}>Recents</span>
          <Button variant="plain" size="sm">Select</Button>
        </Toolbar>
        <div style={{ padding: 'var(--may-space-4)' }}>
          <List variant="plain">
            {['Kyoto', 'Osaka', 'Naoshima', 'Hakone', 'Kanazawa', 'Nara', 'Kobe'].map((place) => (
              <ListRow key={place} title={place} detail="24 photos" onClick={() => {}} />
            ))}
          </List>
        </div>
      </div>
    </Pane>
  ),
}
