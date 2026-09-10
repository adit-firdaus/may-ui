import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from './Card'
import { Button } from '../Button'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Card',
  component: Card,
  argTypes: {
    variant: { control: 'inline-radio', options: ['elevated', 'grouped', 'nested', 'plain'] },
    padding: { control: 'inline-radio', options: ['none', 'xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--may-space-4)',
      maxWidth: 420,
    }}
  >
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Stack>
      <Card {...args}>
        <CardHeader>
          <CardTitle>iCloud Storage</CardTitle>
          <CardDescription>18.4 GB of 50 GB used</CardDescription>
        </CardHeader>
        <CardBody>
          Photos and Messages account for most of your storage. Upgrading gives every device
          on your account more room.
        </CardBody>
        <CardFooter>
          <Button variant="plain">Not Now</Button>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
    </Stack>
  ),
}

/**
 * Four ways to be separated from the page, none of them a stroke: a shadow, a
 * lighter surface, a darker nested fill, or nothing at all.
 */
export const Variants: Story = {
  render: () => (
    <Stack>
      <Card variant="elevated">
        <CardTitle>Elevated</CardTitle>
        <CardDescription>Floats above the page. The only variant that casts a shadow.</CardDescription>
      </Card>
      <Card variant="grouped">
        <CardTitle>Grouped</CardTitle>
        <CardDescription>The Settings card — separated by value alone.</CardDescription>
      </Card>
      <Card variant="grouped" padding="sm">
        <Card variant="nested">
          <CardTitle>Nested</CardTitle>
          <CardDescription>The fill a card takes when it sits inside another card.</CardDescription>
        </Card>
      </Card>
      <Card variant="plain">
        <CardTitle>Plain</CardTitle>
        <CardDescription>Structure without a surface.</CardDescription>
      </Card>
    </Stack>
  ),
}

/**
 * An activatable card is a real `<button>`. It presses into the page — the
 * shadow collapses on the way down and springs back on release.
 */
export const Interactive: Story = {
  render: () => (
    <Stack>
      <Card onClick={() => {}}>
        <CardHeader accessory={<Chevron />}>
          <CardTitle>Ada&rsquo;s MacBook Pro</CardTitle>
          <CardDescription>AirDrop &middot; Nearby</CardDescription>
        </CardHeader>
      </Card>
      <Card onClick={() => {}} variant="grouped">
        <CardHeader accessory={<Chevron />}>
          <CardTitle>Grace&rsquo;s iPhone</CardTitle>
          <CardDescription>AirDrop &middot; Contacts Only</CardDescription>
        </CardHeader>
      </Card>
      <Card onClick={() => {}} disabled>
        <CardHeader accessory={<Chevron />}>
          <CardTitle>Studio Display</CardTitle>
          <CardDescription>Unavailable</CardDescription>
        </CardHeader>
      </Card>
    </Stack>
  ),
}

/**
 * `padding="none"` lets a full-bleed child reach the corners — the card clips
 * them, so the list keeps the card's radius without knowing about it.
 */
export const FullBleed: Story = {
  render: () => (
    <Stack>
      <Card padding="none">
        <CardHeader>
          <CardTitle>Personal Hotspot</CardTitle>
          <CardDescription>Allow others to join</CardDescription>
        </CardHeader>
        <List variant="plain">
          <ListRow title="Wi-Fi Password" detail="qz4m-8k2p" onClick={() => {}} />
          <ListRow title="Maximise Compatibility" subtitle="Reduces Wi-Fi performance" onClick={() => {}} />
          <ListRow title="Family Sharing" detail="On" onClick={() => {}} />
        </List>
      </Card>
    </Stack>
  ),
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden style={{ color: 'var(--may-color-text-tertiary)' }}>
      <path
        d="M6 3.5L10.5 8L6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
