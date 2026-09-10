import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './Select'
import { Field } from '../Field'
import { List, ListRow } from '../List'

const meta = {
  title: 'Catalog/Adaptive/Select',
  component: Select,
  args: {
    'aria-label': 'Sort order',
    options: [
      { label: 'Date Added', value: 'added' },
      { label: 'Date Modified', value: 'modified' },
      { label: 'Name', value: 'name' },
      { label: 'Size', value: 'size' },
      { label: 'Tags', value: 'tags', disabled: true },
    ],
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** The element is a real `<select>`, so it opens the platform picker. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('modified')
    return <Select {...args} value={value} onValueChange={setValue} />
  },
}

/** Until something is picked the placeholder reads as secondary text. */
export const Placeholder: Story = {
  args: { placeholder: 'Choose…' },
}

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--may-space-4)',
        alignItems: 'flex-start',
      }}
    >
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} {...args} size={size} defaultValue="name" />
      ))}
    </div>
  ),
}

/**
 * Inside a `Field` nothing is wired by hand: the label's `for`, the message id,
 * `required` and `aria-invalid` all arrive through context. Passing `error` is
 * the only thing that marks the control invalid — and invalid is a wash of the
 * destructive tone, never a red ring.
 */
export const InAField: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--may-space-6)', maxWidth: 320 }}>
      <Field label="Region" description="Sets the App Store and Siri language.">
        <Select
          fullWidth
          defaultValue="us"
          options={[
            { label: 'United States', value: 'us' },
            { label: 'United Kingdom', value: 'uk' },
            { label: 'Japan', value: 'jp' },
          ]}
        />
      </Field>

      <Field label="Backup Frequency" required error="Choose how often to back up.">
        <Select
          fullWidth
          placeholder="Never"
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
      </Field>

      <Field label="Managed by MDM" disabled>
        <Select fullWidth defaultValue="auto" options={[{ label: 'Automatic', value: 'auto' }]} />
      </Field>
    </div>
  ),
}

/** Trailing a grouped row, the way iOS Settings offers a short list of choices. */
export const InSettings: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <List header="Mail" footer="Threads are grouped by subject across mailboxes.">
        <ListRow
          title="Sort By"
          accessory={
            <Select
              size="sm"
              aria-label="Sort by"
              defaultValue="date"
              options={[
                { label: 'Date', value: 'date' },
                { label: 'Sender', value: 'sender' },
                { label: 'Unread First', value: 'unread' },
              ]}
            />
          }
        />
        <ListRow
          title="Swipe Left"
          accessory={
            <Select
              size="sm"
              aria-label="Swipe left action"
              defaultValue="archive"
              options={[
                { label: 'Archive', value: 'archive' },
                { label: 'Delete', value: 'delete' },
                { label: 'Flag', value: 'flag' },
              ]}
            />
          }
        />
        <ListRow
          title="Preview"
          accessory={
            <Select size="sm" aria-label="Preview lines" defaultValue="2">
              <option value="0">None</option>
              <option value="1">1 Line</option>
              <option value="2">2 Lines</option>
              <option value="5">5 Lines</option>
            </Select>
          }
        />
      </List>
    </div>
  ),
}
