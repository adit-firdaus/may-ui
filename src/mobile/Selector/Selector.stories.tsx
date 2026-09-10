import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Selector } from './Selector'
import type { SelectorOption } from './Selector'

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const icons = {
  moon: 'M12.5 9.8A5.2 5.2 0 0 1 6.2 3.5a5.5 5.5 0 1 0 6.3 6.3z',
  person: 'M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8zM3 14a5 5 0 0 1 10 0',
  briefcase: 'M2 6.5h12v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM6 6.5v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2',
  bed: 'M2 12.5V5M2 8.5h12v4M5.5 8.5v-2h5.5a3 3 0 0 1 3 2',
}

const FOCUS_MODES: SelectorOption[] = [
  { label: 'Do Not Disturb', value: 'dnd', icon: <Glyph d={icons.moon} /> },
  { label: 'Personal', value: 'personal', icon: <Glyph d={icons.person} /> },
  { label: 'Work', value: 'work', icon: <Glyph d={icons.briefcase} /> },
  { label: 'Sleep', value: 'sleep', icon: <Glyph d={icons.bed} /> },
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
