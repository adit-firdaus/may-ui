import type { Meta, StoryObj } from '@storybook/react'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'
import { Text } from '../Text/Text'
import { Badge } from '../Badge/Badge'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview">
      <TabList aria-label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      <TabPanel value="overview"><Text tone="muted">Traffic, errors and latency at a glance.</Text></TabPanel>
      <TabPanel value="activity"><Text tone="muted">Every deploy and configuration change.</Text></TabPanel>
      <TabPanel value="settings"><Text tone="muted">Domains, environment variables and access.</Text></TabPanel>
    </Tabs>
  ),
}

export const Pill: Story = {
  render: () => (
    <Tabs variant="pill" defaultValue="day">
      <TabList aria-label="Date range">
        <Tab value="day">Today</Tab>
        <Tab value="week">This week</Tab>
        <Tab value="month">This month</Tab>
      </TabList>
      <TabPanel value="day"><Text tone="muted">1,284 requests in the last 24 hours.</Text></TabPanel>
      <TabPanel value="week"><Text tone="muted">9,140 requests over 7 days.</Text></TabPanel>
      <TabPanel value="month"><Text tone="muted">38,902 requests over 30 days.</Text></TabPanel>
    </Tabs>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="open">
      <TabList aria-label="Issues">
        <Tab value="open" badge={<Badge size="sm" tone="brand">12</Badge>}>Open</Tab>
        <Tab value="closed" badge={<Badge size="sm">48</Badge>}>Closed</Tab>
        <Tab value="draft" disabled>Draft</Tab>
      </TabList>
      <TabPanel value="open"><Text tone="muted">12 issues need triage.</Text></TabPanel>
      <TabPanel value="closed"><Text tone="muted">48 issues closed this quarter.</Text></TabPanel>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="profile">
      <TabList aria-label="Settings">
        <Tab value="profile">Profile</Tab>
        <Tab value="billing">Billing</Tab>
        <Tab value="security">Security</Tab>
      </TabList>
      <TabPanel value="profile"><Text tone="muted">Your name, avatar and timezone.</Text></TabPanel>
      <TabPanel value="billing"><Text tone="muted">Plan, invoices and payment method.</Text></TabPanel>
      <TabPanel value="security"><Text tone="muted">Password, 2FA and active sessions.</Text></TabPanel>
    </Tabs>
  ),
}
