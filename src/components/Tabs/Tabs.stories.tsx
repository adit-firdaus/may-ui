import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'

const meta = {
  title: 'Catalog/Adaptive/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function Message({ from, subject, preview }: { from: string; subject: string; preview: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--may-space-3) 0',
      }}
    >
      <span style={{ fontWeight: 600 }}>{from}</span>
      <span style={{ fontSize: 'var(--may-text-subheadline)' }}>{subject}</span>
      <span
        style={{
          fontSize: 'var(--may-text-footnote)',
          color: 'var(--may-color-text-secondary)',
        }}
      >
        {preview}
      </span>
    </div>
  )
}

/**
 * The bar slides between tabs — it is never two copies of an indicator
 * cross-fading, which is the tell that separates a native strip from a web one.
 */
export const Underline: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Tabs defaultValue="all">
        <TabList aria-label="Mailbox">
          <Tab value="all">All Mail</Tab>
          <Tab value="unread" badge="3">
            Unread
          </Tab>
          <Tab value="flagged">Flagged</Tab>
          <Tab value="junk" disabled>
            Junk
          </Tab>
        </TabList>

        <TabPanel value="all">
          <Message from="Apple" subject="Your receipt from Apple" preview="iCloud+ 200GB — $2.99" />
          <Message from="Dana Reyes" subject="Re: Friday" preview="Works for me. Want to meet at…" />
          <Message from="TestFlight" subject="Mercury 2.4 is ready" preview="This build expires in 30…" />
        </TabPanel>
        <TabPanel value="unread">
          <Message from="Dana Reyes" subject="Re: Friday" preview="Works for me. Want to meet at…" />
          <Message from="TestFlight" subject="Mercury 2.4 is ready" preview="This build expires in 30…" />
          <Message from="Calendar" subject="Invitation: Design sync" preview="Thursday 10:00 – 10:30" />
        </TabPanel>
        <TabPanel value="flagged">
          <Message from="Apple" subject="Your receipt from Apple" preview="iCloud+ 200GB — $2.99" />
        </TabPanel>
        <TabPanel value="junk">Nothing here.</TabPanel>
      </Tabs>
    </div>
  ),
}

/** The App Store filter shape: a capsule of the tint slides behind the label. */
export const Pill: Story = {
  render: () => {
    const [value, setValue] = useState('today')
    return (
      <div style={{ maxWidth: 520 }}>
        <Tabs variant="pill" value={value} onValueChange={setValue}>
          <TabList aria-label="Charts" fullWidth>
            <Tab value="today">Today</Tab>
            <Tab value="games">Games</Tab>
            <Tab value="apps">Apps</Tab>
            <Tab value="arcade">Arcade</Tab>
          </TabList>
          <TabPanel value="today">Editorial picks, refreshed every morning.</TabPanel>
          <TabPanel value="games">Top free games this week.</TabPanel>
          <TabPanel value="apps">Top free apps this week.</TabPanel>
          <TabPanel value="arcade">Over 200 games. No ads, no in-app purchases.</TabPanel>
        </Tabs>
      </div>
    )
  },
}

/** Vertical strips move the bar along the block axis and take Up/Down instead. */
export const Vertical: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="display" size="md">
      <TabList aria-label="Settings section">
        <Tab value="general">General</Tab>
        <Tab value="display">Display &amp; Brightness</Tab>
        <Tab value="sounds">Sounds &amp; Haptics</Tab>
        <Tab value="privacy">Privacy &amp; Security</Tab>
      </TabList>
      <TabPanel value="general">Software Update, AirDrop, AirPlay, Storage.</TabPanel>
      <TabPanel value="display">Appearance, Text Size, Auto-Lock, Always On.</TabPanel>
      <TabPanel value="sounds">Ringtone, Keyboard Feedback, System Haptics.</TabPanel>
      <TabPanel value="privacy">Location Services, Tracking, App Privacy Report.</TabPanel>
    </Tabs>
  ),
}

/**
 * More tabs than fit: the strip scrolls, and selecting one off-screen brings
 * it into view rather than sliding the bar somewhere you cannot see.
 */
export const Scrolling: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tabs variant="pill" defaultValue="all" size="sm">
        <TabList aria-label="Category">
          <Tab value="all">All</Tab>
          <Tab value="unread">Unread</Tab>
          <Tab value="personal">Personal</Tab>
          <Tab value="work">Work</Tab>
          <Tab value="receipts">Receipts</Tab>
          <Tab value="travel">Travel</Tab>
          <Tab value="newsletters">Newsletters</Tab>
        </TabList>
        <TabPanel value="all">Every message across all mailboxes.</TabPanel>
        <TabPanel value="unread">Messages you have not opened.</TabPanel>
        <TabPanel value="personal">Filed by sender.</TabPanel>
        <TabPanel value="work">Filed by domain.</TabPanel>
        <TabPanel value="receipts">Order confirmations and invoices.</TabPanel>
        <TabPanel value="travel">Boarding passes and hotel bookings.</TabPanel>
        <TabPanel value="newsletters">Subscriptions, batched daily.</TabPanel>
      </Tabs>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-8)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Tabs key={size} size={size} defaultValue="library">
          <TabList aria-label={`Size ${size}`}>
            <Tab value="listen">Listen Now</Tab>
            <Tab value="browse">Browse</Tab>
            <Tab value="library">Library</Tab>
          </TabList>
          <TabPanel value="listen">Made for you.</TabPanel>
          <TabPanel value="browse">New music, playlists and stations.</TabPanel>
          <TabPanel value="library">Recently Added, Artists, Albums, Songs.</TabPanel>
        </Tabs>
      ))}
    </div>
  ),
}
