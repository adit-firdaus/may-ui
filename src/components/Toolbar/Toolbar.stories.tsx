import type { Meta, StoryObj } from '@storybook/react'
import { Toolbar, ToolbarSpacer } from './Toolbar'
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
        <IconButton aria-label="Move to folder"><FolderIcon /></IconButton>
        <IconButton aria-label="Delete message" tone="danger"><TrashIcon /></IconButton>
        <IconButton aria-label="Reply"><ReplyIcon /></IconButton>
        <IconButton aria-label="Forward"><ForwardIcon /></IconButton>
        <IconButton aria-label="New message"><ComposeIcon /></IconButton>
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
        <IconButton aria-label="Share"><ShareIcon /></IconButton>
        <IconButton aria-label="Delete" tone="danger"><TrashIcon /></IconButton>
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

/* ------------------------------- glyphs ---------------------------------- */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 10h6.4L14 6" {...stroke} />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M3 6.5A1.5 1.5 0 014.5 5h3l1.5 2h6.5A1.5 1.5 0 0117 8.5v6A1.5 1.5 0 0115.5 16h-11A1.5 1.5 0 013 14.5z" {...stroke} />
    </svg>
  )
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M8 5L3.5 9.5 8 14" {...stroke} />
      <path d="M3.5 9.5H12a4.5 4.5 0 014.5 4.5v1" {...stroke} />
    </svg>
  )
}

function ForwardIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M12 5l4.5 4.5L12 14" {...stroke} />
      <path d="M16.5 9.5H8A4.5 4.5 0 003.5 14v1" {...stroke} />
    </svg>
  )
}

function ComposeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M16.5 5.5l-2-2-8 8-.8 2.8 2.8-.8z" {...stroke} />
      <path d="M4 16.5h12" {...stroke} />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5" {...stroke} />
      <path d="M4.5 11v5.5h11V11" {...stroke} />
    </svg>
  )
}
