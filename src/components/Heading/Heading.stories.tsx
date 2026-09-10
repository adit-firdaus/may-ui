import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './Heading'
import { Text } from '../Text/Text'

const meta = {
  title: 'Catalog/Adaptive/Heading',
  component: Heading,
  args: { children: 'Screen Time' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: {
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
      ],
    },
    tone: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'tint', 'danger', 'success'],
    },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-5)', maxWidth: 560 }}>
    {children}
  </div>
)

export const Default: Story = {}

/** Each rank's default style: display sizes down to 4, UI sizes at 5 and 6. */
export const Levels: Story = {
  render: () => (
    <Column>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <div key={level} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-1)' }}>
          <Text variant="caption-2" tone="tertiary" mono>
            h{level}
          </Text>
          <Heading level={level}>Notifications</Heading>
        </div>
      ))}
    </Column>
  ),
}

/**
 * Rank is structure, size is looks. Every heading here is an `h2` — the outline
 * stays correct while the page gets the visual hierarchy it actually needs.
 */
export const SizeIndependentOfLevel: Story = {
  render: () => (
    <Column>
      <Heading level={2} size="large-title">
        Privacy &amp; Security
      </Heading>
      <Heading level={2} size="title-3">
        App Privacy Report
      </Heading>
      <Heading level={2} size="headline">
        Tracking
      </Heading>
      <Heading level={2} size="subheadline" tone="secondary">
        Analytics &amp; Improvements
      </Heading>
    </Column>
  ),
}

/** A Newsroom-style article opener: title, standfirst, dateline. */
export const ArticleHeader: Story = {
  render: () => (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)' }}>
      <Text variant="footnote" tone="tint" as="span">
        UPDATE
      </Text>
      <Heading level={1}>iOS 18.2 brings scheduled Focus filters to iPhone</Heading>
      <Text variant="callout" tone="secondary">
        Focus can now hand each app a different view of your data on a schedule, so work accounts
        disappear at six and come back at nine.
      </Text>
      <Text variant="caption-1" tone="tertiary">
        Cupertino, California &middot; 4 min read
      </Text>
    </div>
  ),
}

/** A long title clamped to two lines — `balance` still evens what remains. */
export const Clamped: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Heading level={3} clamp={2}>
        Allow apps to request permission to track you across other companies&rsquo; apps and websites
      </Heading>
    </div>
  ),
}
