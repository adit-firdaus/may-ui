import type { Meta, StoryObj } from '@storybook/react'
import { DescriptionItem, Descriptions } from '.'
import { Card } from '../Card'

const meta = {
  title: 'Catalog/Adaptive/Descriptions',
  component: Descriptions,
  argTypes: {
    layout: { control: 'inline-radio', options: ['inline', 'stacked'] },
    variant: { control: 'inline-radio', options: ['inset', 'plain'] },
    columns: { control: { type: 'range', min: 1, max: 3, step: 1 } },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Descriptions>

export default meta
type Story = StoryObj<typeof meta>

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 640 }}>{children}</div>
)

/** Settings ▸ General ▸ About, more or less exactly. */
export const Default: Story = {
  render: (args) => (
    <Frame>
      <Descriptions {...args} header="About">
        <DescriptionItem label="Model Name" value="iPhone 15 Pro" />
        <DescriptionItem label="Model Number" value="MTQ63LL/A" />
        <DescriptionItem label="Serial Number" value="F2LX9QK3P4Y" />
        <DescriptionItem label="iOS Version" value="18.2 (22C152)" />
        <DescriptionItem label="Capacity" value="256 GB" />
      </Descriptions>
    </Frame>
  ),
}

/**
 * `columns` splits the pairs across the card ON DESKTOP ONLY — a phone stays
 * at one column, where two would be narrower than the values themselves.
 * Narrow the viewport past 1024px to watch it collapse.
 */
export const Columns: Story = {
  render: () => (
    <Frame>
      <Descriptions header="Network" columns={2} footer="Values refresh when the device rejoins the network.">
        <DescriptionItem label="IP Address" value="192.168.1.24" />
        <DescriptionItem label="Subnet Mask" value="255.255.255.0" />
        <DescriptionItem label="Router" value="192.168.1.1" />
        <DescriptionItem label="DNS" value="1.1.1.1" />
        <DescriptionItem label="Private Wi-Fi Address" value="On" />
        <DescriptionItem label="Limit IP Tracking" value="On" />
      </Descriptions>
    </Frame>
  ),
}

/** `stacked` is the Contacts shape: label above the value, left-aligned. */
export const Stacked: Story = {
  render: () => (
    <Frame>
      <Descriptions header="Contact" layout="stacked" columns={2}>
        <DescriptionItem label="mobile" value="+1 (415) 555-0142" />
        <DescriptionItem label="work" value="+1 (415) 555-0198" />
        <DescriptionItem label="home" value="ada@example.com" />
        <DescriptionItem
          label="address"
          value={
            <>
              1 Infinite Loop
              <br />
              Cupertino, CA 95014
            </>
          }
        />
      </Descriptions>
    </Frame>
  ),
}

/**
 * A value is a node, not a string — a status dot, a tinted word, anything the
 * row needs.
 */
export const RichValues: Story = {
  render: () => (
    <Frame>
      <Descriptions header="iCloud">
        <DescriptionItem label="Account" value="ada@example.com" />
        <DescriptionItem
          label="Status"
          value={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--may-space-2)' }}>
              <Dot />
              Synced
            </span>
          }
        />
        <DescriptionItem label="Storage" value={<span style={{ color: 'var(--may-color-warning)' }}>18.4 GB of 50 GB</span>} />
        <DescriptionItem label="Last Backup" value="Today, 4:12 AM" />
      </Descriptions>
    </Frame>
  ),
}

/** `variant="plain"` drops the card, for pairs already inside one. */
export const InsideACard: Story = {
  render: () => (
    <Frame>
      <Card padding="none">
        <Descriptions variant="plain">
          <DescriptionItem label="From" value="Ada Lovelace" />
          <DescriptionItem label="To" value="Analytical Engine Team" />
          <DescriptionItem label="Date" value="Today, 9:41 AM" />
          <DescriptionItem label="Attachments" value="2 files &middot; 1.4 MB" />
        </Descriptions>
      </Card>
    </Frame>
  ),
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: 'var(--may-radius-full)',
        background: 'var(--may-color-success)',
        display: 'inline-block',
      }}
    />
  )
}
