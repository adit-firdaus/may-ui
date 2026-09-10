import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from './ScrollArea'

const meta = {
  title: 'Catalog/Adaptive/ScrollArea',
  component: ScrollArea,
  args: { maxHeight: 280 },
  argTypes: {
    axis: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const MAIL = [
  ['TestFlight', 'Xcode 16.2 is now available', '9:41 AM'],
  ['Apple Developer', 'Your membership renews soon', '8:02 AM'],
  ['iCloud', 'Storage is almost full', 'Yesterday'],
  ['Craig Federighi', 'Re: Notification Summaries', 'Yesterday'],
  ['App Store Connect', 'Version 3.1 is ready for sale', 'Monday'],
  ['Maps', 'Your trip to Cupertino', 'Monday'],
  ['Photos', 'A new memory is ready', 'Sunday'],
  ['Fitness', 'You closed all three rings', 'Sunday'],
]

/** A Mail list that scrolls inside a card and stops the page behind it moving. */
export const MailList: Story = {
  render: (args) => (
    <ScrollArea
      {...args}
      aria-label="Inbox"
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
      }}
    >
      {MAIL.map(([from, subject, time]) => (
        <div key={subject} style={{ padding: 'var(--may-space-3) var(--may-space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--may-space-3)' }}>
            <span style={{ fontSize: 'var(--may-text-headline)', fontWeight: 600 }}>{from}</span>
            <span style={{ fontSize: 'var(--may-text-footnote)', color: 'var(--may-color-text-tertiary)' }}>
              {time}
            </span>
          </div>
          <div style={{ fontSize: 'var(--may-text-subheadline)', color: 'var(--may-color-text-secondary)' }}>
            {subject}
          </div>
        </div>
      ))}
    </ScrollArea>
  ),
}

/** A horizontal shelf. The cross axis is locked, so no phantom scrollbar. */
export const Horizontal: Story = {
  args: { axis: 'horizontal', maxHeight: undefined },
  render: (args) => (
    <ScrollArea {...args} aria-label="Continue watching">
      <div style={{ display: 'flex', gap: 'var(--may-space-3)', paddingBottom: 'var(--may-space-3)' }}>
        {['Severance', 'Ted Lasso', 'For All Mankind', 'Slow Horses', 'Silo', 'The Morning Show'].map(
          (title) => (
            <div key={title} style={{ flex: '0 0 auto', width: 140 }}>
              <div
                style={{
                  height: 84,
                  borderRadius: 'var(--may-radius-lg)',
                  background: 'var(--may-grad-indigo)',
                  boxShadow: 'var(--may-shadow-sm)',
                }}
              />
              <div style={{ fontSize: 'var(--may-text-footnote)', marginTop: 'var(--may-space-2)' }}>
                {title}
              </div>
            </div>
          ),
        )}
      </div>
    </ScrollArea>
  ),
}

/** Both axes, for content that is genuinely wider than the viewport. */
export const BothAxes: Story = {
  args: { axis: 'both', maxHeight: 200 },
  render: (args) => (
    <ScrollArea
      {...args}
      aria-label="Battery history"
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        padding: 'var(--may-space-4)',
      }}
    >
      <div style={{ width: 720, display: 'flex', flexDirection: 'column', gap: 'var(--may-space-3)' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--may-space-4)', fontSize: 'var(--may-text-footnote)' }}>
            <span style={{ width: 120, color: 'var(--may-color-text-secondary)' }}>Day {i + 1}</span>
            <span style={{ flex: 1, height: 12, borderRadius: 'var(--may-radius-full)', background: 'var(--may-color-fill-tertiary)' }}>
              <span
                style={{
                  display: 'block',
                  width: `${40 + i * 7}%`,
                  height: '100%',
                  borderRadius: 'var(--may-radius-full)',
                  background: 'var(--may-color-success)',
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

/** Short content simply does not scroll — max-height is a ceiling, not a size. */
export const UnderTheCeiling: Story = {
  render: (args) => (
    <ScrollArea
      {...args}
      style={{
        maxWidth: 420,
        background: 'var(--may-color-surface)',
        borderRadius: 'var(--may-radius-card)',
        padding: 'var(--may-space-4)',
        fontSize: 'var(--may-text-body)',
      }}
    >
      Two lines of content in a region that would allow eight.
    </ScrollArea>
  ),
}
