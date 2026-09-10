import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Accordion, AccordionItem } from './Accordion'
import { Descriptions, DescriptionItem } from '../Descriptions'

const meta = {
  title: 'Catalog/Adaptive/Accordion',
  component: Accordion,
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    variant: { control: 'inline-radio', options: ['inset', 'plain'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 480 }}>{children}</div>
)

/**
 * The default: one item open at a time, in a grouped card with hairlines
 * between the rows — six questions reading as one panel rather than six
 * floating cards.
 */
export const Default: Story = {
  render: (args) => (
    <Frame>
      <Accordion {...args} header="Frequently Asked" defaultValue={['relay']}>
        <AccordionItem value="relay" title="What is iCloud Private Relay?">
          Requests leave your device encrypted and travel through two separate relays, so no
          single party can see both who you are and which site you are visiting.
        </AccordionItem>
        <AccordionItem value="hide" title="What does Hide My Email do?">
          It creates a unique, random address that forwards to your personal inbox. Delete it
          at any time and the sender simply stops reaching you.
        </AccordionItem>
        <AccordionItem value="backup" title="How much does iCloud back up?">
          Everything on the device except what is already stored in iCloud: app data, Home
          screen layout, Messages, ringtones and Apple Watch backups.
        </AccordionItem>
      </Accordion>
    </Frame>
  ),
}

/** `type="multiple"` lets any number of panels stay open at once. */
export const Multiple: Story = {
  render: () => (
    <Frame>
      <Accordion
        type="multiple"
        header="Storage"
        footer="Deleting an app also deletes its documents and data."
        defaultValue={['photos', 'messages']}
      >
        <AccordionItem value="photos" title="Photos" detail="11.2 GB" leading={<Glyph tint="var(--may-yellow)" />}>
          8,412 photos and 214 videos. Optimise iPhone Storage keeps smaller versions on this
          device while the originals stay in iCloud.
        </AccordionItem>
        <AccordionItem value="messages" title="Messages" detail="4.1 GB" leading={<Glyph tint="var(--may-green)" />}>
          Attachments account for 3.6 GB. Keeping messages for one year instead of forever
          would recover most of it.
        </AccordionItem>
        <AccordionItem value="mail" title="Mail" detail="1.8 GB" leading={<Glyph tint="var(--may-blue)" />}>
          Mail stores recent messages for offline search. It clears the cache automatically
          when the device runs low on space.
        </AccordionItem>
      </Accordion>
    </Frame>
  ),
}

/** A panel can hold anything — here a nested grouped list of pairs. */
export const RichPanels: Story = {
  render: () => (
    <Frame>
      <Accordion header="About">
        <AccordionItem value="device" title="Device" subtitle="iPhone 15 Pro">
          <Descriptions variant="plain">
            <DescriptionItem label="Model Name" value="iPhone 15 Pro" />
            <DescriptionItem label="Model Number" value="MTQ63LL/A" />
            <DescriptionItem label="Serial Number" value="F2LX9QK3P4Y" />
          </Descriptions>
        </AccordionItem>
        <AccordionItem value="network" title="Network" subtitle="Wi-Fi">
          <Descriptions variant="plain">
            <DescriptionItem label="IP Address" value="192.168.1.24" />
            <DescriptionItem label="Router" value="192.168.1.1" />
            <DescriptionItem label="Private Wi-Fi Address" value="On" />
          </Descriptions>
        </AccordionItem>
      </Accordion>
    </Frame>
  ),
}

/**
 * Controlled, with `collapsible={false}`: one item is always open, the way a
 * settings pane that must always show something behaves.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState<string[]>(['general'])
    return (
      <Frame>
        <Accordion value={open} onValueChange={setOpen} collapsible={false} header={`Open: ${open.join(', ') || 'none'}`}>
          <AccordionItem value="general" title="General">
            Software Update, AirDrop, AirPlay and Handoff live here.
          </AccordionItem>
          <AccordionItem value="privacy" title="Privacy &amp; Security">
            Location Services, Tracking, App Privacy Report and Lockdown Mode.
          </AccordionItem>
          <AccordionItem value="dev" title="Developer" disabled>
            Requires a provisioning profile.
          </AccordionItem>
        </Accordion>
      </Frame>
    )
  },
}

/** A small rounded square standing in for an app icon tile. */
function Glyph({ tint }: { tint: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 29,
        height: 29,
        borderRadius: 'var(--may-radius-sm)',
        background: tint,
        display: 'inline-block',
      }}
    />
  )
}
