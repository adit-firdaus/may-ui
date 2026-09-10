import type { Meta, StoryObj } from '@storybook/react'
import type { MayTextStyle } from '../../types'
import { Text } from './Text'

const meta = {
  title: 'Catalog/Adaptive/Text',
  component: Text,
  args: { children: 'Your iPhone is up to date.' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'large-title',
        'title-1',
        'title-2',
        'title-3',
        'headline',
        'body',
        'callout',
        'subheadline',
        'footnote',
        'caption-1',
        'caption-2',
      ],
    },
    tone: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'tint', 'danger', 'success'],
    },
    weight: { control: 'inline-radio', options: ['regular', 'medium', 'semibold', 'bold'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

const STYLES: MayTextStyle[] = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
]

const Column = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--may-space-4)',
      maxWidth: 520,
    }}
  >
    {children}
  </div>
)

export const Default: Story = {}

/**
 * All eleven styles. Note that `headline` and `body` are the same size — the
 * weight and tracking are the whole difference, which is why a variant sets
 * four tokens rather than one.
 */
export const Scale: Story = {
  render: () => (
    <Column>
      {STYLES.map((style) => (
        <div key={style} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
          <Text variant="caption-2" tone="tertiary" mono>
            {style}
          </Text>
          <Text variant={style}>Software Update</Text>
        </div>
      ))}
    </Column>
  ),
}

export const Tones: Story = {
  render: () => (
    <Column>
      <Text>iCloud Backup is on.</Text>
      <Text tone="secondary">Last backup: Today at 9:41 AM</Text>
      <Text tone="tertiary">Backups include app data, settings and Home screen layout.</Text>
      <Text tone="tint">Learn more about iCloud Backup</Text>
      <Text tone="danger">Not enough iCloud storage.</Text>
      <Text tone="success">Backup complete.</Text>
    </Column>
  ),
}

/** A Mail-style preview: two lines, then an ellipsis. */
export const Clamped: Story = {
  render: () => (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
      <Text variant="headline" as="span">
        Ana Ramirez
      </Text>
      <Text variant="subheadline" as="span">
        Re: Thursday offsite
      </Text>
      <Text variant="subheadline" tone="secondary" clamp={2}>
        Booked the room on the fourth floor for 2pm, and I moved the design review to the morning so
        nobody has to jump between buildings twice. Ping me if that clashes with anything on your
        side and I will shuffle it again.
      </Text>
    </div>
  ),
}

/** `weight` and `mono` override one axis each; the variant keeps the rest. */
export const Overrides: Story = {
  render: () => (
    <Column>
      <Text variant="body" weight="semibold">
        Body at semibold — tracking stays body&rsquo;s, not headline&rsquo;s
      </Text>
      <Text variant="title-2" weight="medium">
        Title 2 lightened to medium
      </Text>
      <Text variant="footnote" tone="secondary" mono>
        Serial F2LW48ZXQ1 &middot; Model A2650 &middot; iOS 18.2 (22C152)
      </Text>
      <Text variant="caption-1" tone="tertiary" align="center">
        Centred caption, logical so RTL flips for free
      </Text>
    </Column>
  ),
}

/** How the styles stack in a real screen — the About panel's footer copy. */
export const InContext: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        padding: 'var(--may-space-5)',
        borderRadius: 'var(--may-radius-card)',
        background: 'var(--may-color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-2)',
      }}
    >
      <Text variant="title-2">iOS 18.2</Text>
      <Text variant="subheadline" tone="secondary">
        This update includes bug fixes and security improvements for your iPhone, and adds support
        for scheduled Focus filters.
      </Text>
      <Text variant="footnote" tone="tint" as="span">
        Learn more about updates
      </Text>
      <Text variant="caption-2" tone="tertiary">
        3.14 GB &middot; Downloaded
      </Text>
    </div>
  ),
}
