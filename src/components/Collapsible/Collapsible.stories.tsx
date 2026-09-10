import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Collapsible } from './Collapsible'
import { Button } from '../Button'
import { Card } from '../Card'

const meta = {
  title: 'Catalog/Adaptive/Collapsible',
  component: Collapsible,
  args: { trigger: 'Advanced Options' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)' }}>
    {children}
  </div>
)

/**
 * The primitive on its own. The panel animates its real height — no measured
 * `scrollHeight`, no guessed `max-height` — and the chevron rides the same
 * spring, so the two read as one gesture.
 */
export const Default: Story = {
  render: (args) => (
    <Frame>
      <Collapsible {...args}>
        Private Wi-Fi Address is on for this network. Your device uses a different MAC address
        each time it joins, which makes it harder to track across networks.
      </Collapsible>
    </Frame>
  ),
}

/** `defaultOpen` starts expanded and still owns its own state afterwards. */
export const DefaultOpen: Story = {
  render: () => (
    <Frame>
      <Collapsible trigger="What is iCloud Private Relay?" defaultOpen>
        Private Relay sends your requests through two separate internet relays, so no single
        party can combine your IP address with the sites you visit.
      </Collapsible>
    </Frame>
  ),
}

/**
 * Controlled: the parent owns `open`, so anything can toggle it — here a
 * button that is nowhere near the disclosure.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Frame>
        <Button variant="tinted" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide diagnostics' : 'Show diagnostics'}
        </Button>
        <Collapsible
          trigger="Diagnostics"
          open={open}
          onOpenChange={setOpen}
        >
          Last sync 2 minutes ago &middot; 148 items uploaded &middot; No errors reported since
          Tuesday.
        </Collapsible>
      </Frame>
    )
  },
}

/** Inside a card, with the trigger carrying its own trailing value. */
export const InACard: Story = {
  render: () => (
    <Frame>
      <Card padding="xs">
        <Collapsible
          trigger={
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--may-space-3)' }}>
              <span>Storage</span>
              <span style={{ color: 'var(--may-color-text-secondary)' }}>18.4 GB</span>
            </span>
          }
        >
          Photos 11.2 GB &middot; Messages 4.1 GB &middot; Mail 1.8 GB &middot; Other 1.3 GB
        </Collapsible>
      </Card>
    </Frame>
  ),
}

/** A disabled disclosure keeps its row but cannot be opened. */
export const Disabled: Story = {
  render: () => (
    <Frame>
      <Collapsible trigger="Developer Settings" disabled>
        Only visible while a provisioning profile is installed.
      </Collapsible>
    </Frame>
  ),
}
