import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { IoBedOutline, IoBriefcaseOutline, IoMoonOutline, IoPersonOutline } from 'react-icons/io5'
import { Selector } from '.'
import type { SelectorOption } from '.'

const FOCUS_MODES: SelectorOption[] = [
  { label: 'Do Not Disturb', value: 'dnd', icon: <IoMoonOutline aria-hidden /> },
  { label: 'Personal', value: 'personal', icon: <IoPersonOutline aria-hidden /> },
  { label: 'Work', value: 'work', icon: <IoBriefcaseOutline aria-hidden /> },
  { label: 'Sleep', value: 'sleep', icon: <IoBedOutline aria-hidden /> },
]

const meta = {
  title: 'Catalog/Mobile/Selector',
  component: Selector,
  args: { options: FOCUS_MODES },
  argTypes: {
    variant: { control: 'inline-radio', options: ['card', 'chip'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Selector>

export default meta
type Story = StoryObj<typeof meta>

/* Phone-width, on the grouped background these are always presented against. */
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ maxWidth: '24rem', marginBottom: 'var(--may-space-8)' }}>
      <h3
        style={{
          margin: '0 0 var(--may-space-3)',
          fontSize: 'var(--may-text-footnote)',
          lineHeight: 'var(--may-text-footnote-leading)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--may-color-text-secondary)',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * Single select. Tap a second card to move the selection; tap the *active* one
 * again and nothing happens — a one-of-many control has no "none", so the
 * toggle-off signal is swallowed rather than emitted as an empty value.
 */
export const Default: Story = {
  render: () => {
    const [focus, setFocus] = useState('work')
    return (
      <Panel title="Focus">
        <Selector
          options={FOCUS_MODES}
          value={focus}
          onChange={setFocus}
          aria-label="Focus mode"
        />
      </Panel>
    )
  },
}

/** Chips wrap at their natural width and grow to make room for the check. */
export const Chips: Story = {
  render: () => {
    const [sort, setSort] = useState('recents')
    return (
      <Panel title="Sort By">
        <Selector
          variant="chip"
          options={[
            { label: 'Recents', value: 'recents' },
            { label: 'Name', value: 'name' },
            { label: 'Kind', value: 'kind' },
            { label: 'Date Added', value: 'added' },
            { label: 'Size', value: 'size' },
            { label: 'Tags', value: 'tags' },
          ]}
          value={sort}
          onChange={setSort}
          aria-label="Sort by"
        />
      </Panel>
    )
  },
}

/** Multi-select is a set of toggles, so re-tapping an active chip *does* clear it. */
export const Multiple: Story = {
  render: () => {
    const [sources, setSources] = useState<string[]>(['mail', 'photos'])
    return (
      <Panel title="Show in Search">
        <Selector
          multiple
          variant="chip"
          options={[
            { label: 'Apps', value: 'apps' },
            { label: 'Contacts', value: 'contacts' },
            { label: 'Mail', value: 'mail' },
            { label: 'Messages', value: 'messages' },
            { label: 'Music', value: 'music' },
            { label: 'Photos', value: 'photos' },
            { label: 'Siri Suggestions', value: 'siri', disabled: true },
          ]}
          value={sources}
          onChange={setSources}
          aria-label="Search sources"
        />
        <p
          style={{
            margin: 'var(--may-space-3) 0 0',
            fontSize: 'var(--may-text-footnote)',
            color: 'var(--may-color-text-secondary)',
          }}
        >
          {sources.length === 0 ? 'Nothing selected' : `${sources.length} selected`}
        </p>
      </Panel>
    )
  },
}

/** `columns={1}` stacks the cards into a list, where a description has room. */
export const StackedCards: Story = {
  render: () => {
    const [plan, setPlan] = useState('200gb')
    return (
      <Panel title="iCloud+ Plan">
        <Selector
          columns={1}
          size="lg"
          options={[
            { label: '50 GB', value: '50gb', description: '$0.99 a month' },
            { label: '200 GB', value: '200gb', description: '$2.99 a month · Family Sharing' },
            { label: '2 TB', value: '2tb', description: '$9.99 a month · Family Sharing' },
            { label: '12 TB', value: '12tb', description: 'Not available in this region', disabled: true },
          ]}
          value={plan}
          onChange={setPlan}
          aria-label="Storage plan"
        />
      </Panel>
    )
  },
}

/** Every rung keeps the 44px target — `sm` spends its compactness on type. */
export const Sizes: Story = {
  render: () => (
    <>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Panel key={size} title={size}>
          <Selector
            variant="chip"
            size={size}
            defaultValue="colour"
            options={[
              { label: 'Automatic', value: 'auto' },
              { label: 'Colour', value: 'colour' },
              { label: 'Black & White', value: 'bw' },
            ]}
            aria-label={`Appearance (${size})`}
          />
        </Panel>
      ))}
    </>
  ),
}
