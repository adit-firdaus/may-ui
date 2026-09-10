import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { List, ListRow } from '../../components/List'
import { SearchBar } from './SearchBar'

const meta = {
  title: 'Catalog/Mobile/SearchBar',
  component: SearchBar,
  args: { placeholder: 'Search' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    showCancel: { control: 'inline-radio', options: ['auto', 'always', 'never'] },
    align: { control: 'inline-radio', options: ['center', 'leading'] },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

/* A phone-width column on the grouped background, which is the only place a
 * full-width bar can be judged — stretched across a desktop canvas it reads as
 * a different control entirely. */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: '24rem',
        margin: '0 auto',
        padding: 'var(--may-space-4) 0',
        background: 'var(--may-color-bg)',
        minHeight: '24rem',
      }}
    >
      {children}
    </div>
  )
}

const MAILBOX = [
  { from: 'Apple Developer', subject: 'Your app is Ready for Distribution', at: '9:41 AM' },
  { from: 'Rosa Delgado', subject: 'Re: Q3 planning — one more thought', at: '9:12 AM' },
  { from: 'TestFlight', subject: 'May UI 0.4 (128) is now available', at: 'Yesterday' },
  { from: 'Priya Raman', subject: 'Sheet drag feels great on device', at: 'Yesterday' },
  { from: 'App Store Connect', subject: 'Weekly summary for May UI', at: 'Monday' },
  { from: 'Jonas Weber', subject: 'Hairline is one physical pixel now', at: 'Monday' },
]

/** The bar as it actually ships: pinned above a list, filtering it live. */
export const Default: Story = {
  render: (args) => {
    const [query, setQuery] = useState('')
    const needle = query.trim().toLowerCase()
    const results = MAILBOX.filter(
      (mail) =>
        !needle ||
        mail.from.toLowerCase().includes(needle) ||
        mail.subject.toLowerCase().includes(needle),
    )

    return (
      <Phone>
        <SearchBar {...args} value={query} onValueChange={setQuery} onCancel={() => setQuery('')} />
        <div style={{ padding: '0 var(--may-space-4)' }}>
          <List>
            {results.map((mail) => (
              <ListRow key={mail.subject} title={mail.from} subtitle={mail.subject} detail={mail.at} onClick={() => {}} />
            ))}
            {results.length === 0 && <ListRow title="No Results" subtitle={`No mail matches “${query}”`} />}
          </List>
        </div>
      </Phone>
    )
  },
}

/**
 * `sm` is the 36px pill iOS puts under a large title; the 44px touch target
 * survives because the band, not the pill, carries the vertical padding.
 */
export const Sizes: Story = {
  render: (args) => (
    <Phone>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SearchBar key={size} {...args} size={size} placeholder={`Search (${size})`} />
      ))}
    </Phone>
  ),
}

/**
 * `auto` is iOS: Cancel arrives on focus and leaves on blur, but stays while
 * there is still text — text is the thing left to cancel. `always` suits a
 * screen that exists to search; `never` suits a bar that only filters the list
 * beneath it and never takes over the view.
 */
export const CancelModes: Story = {
  render: (args) => (
    <Phone>
      {(['auto', 'always', 'never'] as const).map((mode) => (
        <SearchBar key={mode} {...args} showCancel={mode} placeholder={`showCancel="${mode}"`} />
      ))}
    </Phone>
  ),
}

/**
 * Focus either bar to watch the lead travel. `center` is the list-header rest
 * state — magnifier and placeholder sit in the middle of the pill until the
 * bar wakes up. `leading` pins them, for a bar that is never idle.
 */
export const Alignment: Story = {
  render: (args) => (
    <Phone>
      <SearchBar {...args} align="center" placeholder="Search Mailboxes" />
      <SearchBar {...args} align="leading" placeholder="Search Mailboxes" />
      <SearchBar {...args} defaultValue="planning" placeholder="Search Mailboxes" />
      <SearchBar {...args} disabled placeholder="Search unavailable" />
    </Phone>
  ),
}
