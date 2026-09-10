import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'
import { SearchField } from './SearchField'
import { Field } from '../Field/Field'

const meta = {
  title: 'Catalog/Adaptive/SearchField',
  component: SearchField,
  args: { placeholder: 'Search', fullWidth: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--may-space-4)', maxWidth: 440 }}>
    {children}
  </div>
)

const SETTINGS = [
  { title: 'Wi-Fi', detail: 'Home' },
  { title: 'Bluetooth', detail: 'On' },
  { title: 'Cellular', detail: '' },
  { title: 'Personal Hotspot', detail: 'Off' },
  { title: 'Notifications', detail: '' },
  { title: 'Sounds & Haptics', detail: '' },
  { title: 'Screen Time', detail: '' },
  { title: 'Focus', detail: 'Do Not Disturb' },
]

/** The clear glyph springs in the instant there is something to clear, and disappears the same way. */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <SearchField {...args} defaultValue="Wi-Fi" />
    </div>
  ),
}

/**
 * Cancel slides in from the trailing edge as the field becomes active — focus
 * it to see it arrive on `--may-spring-snappy`. Its width is measured, because
 * `width: 0 → auto` does not interpolate and every CSS-only substitute either
 * stalls or refuses to spring.
 */
export const Cancelable: Story = {
  render: (args) => (
    <Column>
      <SearchField {...args} cancelable placeholder="Search Mail" />
      <SearchField {...args} cancelable defaultValue="federighi" placeholder="Search Mail" />
    </Column>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Column>
      <SearchField {...args} size="sm" placeholder="Small" />
      <SearchField {...args} size="md" placeholder="Medium" />
      <SearchField {...args} size="lg" placeholder="Large" />
    </Column>
  ),
}

/** Settings search: typing filters as you go, Escape empties the field, and Cancel clears and dismisses it. */
export const FilteringSettings: Story = {
  render: (args) => {
    const [query, setQuery] = useState('')
    const results = useMemo(
      () => SETTINGS.filter((row) => row.title.toLowerCase().includes(query.trim().toLowerCase())),
      [query],
    )

    return (
      <Column>
        <SearchField {...args} cancelable value={query} onValueChange={setQuery} />

        <div
          style={{
            background: 'var(--may-color-surface)',
            borderRadius: 'var(--may-radius-card)',
            overflow: 'hidden',
          }}
        >
          {results.map((row) => (
            <div
              key={row.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 'var(--may-control-h)',
                padding: 'var(--may-space-2) var(--may-space-4)',
              }}
            >
              <span>{row.title}</span>
              <span style={{ color: 'var(--may-color-text-secondary)' }}>{row.detail}</span>
            </div>
          ))}
          {results.length === 0 && (
            <div
              style={{
                minHeight: 'var(--may-control-h)',
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--may-space-2) var(--may-space-4)',
                color: 'var(--may-color-text-secondary)',
              }}
            >
              No Results
            </div>
          )}
        </div>
      </Column>
    )
  },
}

export const InAFieldAndDisabled: Story = {
  render: (args) => (
    <Column>
      <Field label="Saved Search" error="Give this search a name before saving it.">
        <SearchField {...args} placeholder="Unread from Craig" />
      </Field>
      <SearchField {...args} disabled defaultValue="Search unavailable offline" />
    </Column>
  ),
}
