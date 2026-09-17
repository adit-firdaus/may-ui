import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IoGitBranchOutline, IoPersonCircleOutline } from 'react-icons/io5'
import { Combobox } from '.'
import { Field } from '../Field'
import { Stack } from '../Stack'
import { Text } from '../Text'

const LANGUAGES = [
  { value: 'swift', label: 'Swift', description: 'Apple platforms' },
  { value: 'ts', label: 'TypeScript', description: 'Everywhere else' },
  { value: 'rust', label: 'Rust', description: 'When it has to be fast' },
  { value: 'go', label: 'Go', description: 'When it has to ship' },
  { value: 'python', label: 'Python', description: 'When it has to be read' },
  { value: 'elixir', label: 'Elixir', disabled: true },
]

const meta = {
  title: 'Catalog/Adaptive/Combobox',
  component: Combobox,
  args: { options: LANGUAGES, placeholder: 'Pick a language' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Type to narrow, arrow to move, Enter to choose. Focus never leaves the
 * input — the active row moves through `aria-activedescendant` — which is what
 * lets you keep typing after an arrow key.
 */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Combobox {...args} fullWidth />
    </div>
  ),
}

/** Several values, each removable. Backspace on an empty query peels the last one. */
export const Multiple: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <Combobox {...args} multiple fullWidth placeholder="Pick a few" />
    </div>
  ),
}

/** Grouped rows. The group is a real `role="group"` with its heading as the name. */
export const Grouped: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Combobox
        fullWidth
        placeholder="Assign to"
        options={[
          { value: 'ada', label: 'Ada Lovelace', group: 'Maintainers', icon: <IoPersonCircleOutline aria-hidden /> },
          { value: 'alan', label: 'Alan Turing', group: 'Maintainers', icon: <IoPersonCircleOutline aria-hidden /> },
          { value: 'grace', label: 'Grace Hopper', group: 'Contributors', icon: <IoPersonCircleOutline aria-hidden /> },
          { value: 'edsger', label: 'Edsger Dijkstra', group: 'Contributors', icon: <IoPersonCircleOutline aria-hidden /> },
        ]}
      />
    </div>
  ),
}

/** Inside a `Field`, the label, error and `aria-describedby` wiring come free. */
export const InAField: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | string[]>('')
    return (
      <div style={{ width: 320 }}>
        <Field
          label="Primary language"
          description="Used to pick syntax highlighting."
          error={value === '' ? 'Choose one to continue.' : undefined}
        >
          <Combobox {...args} fullWidth value={value} onValueChange={setValue} />
        </Field>
      </div>
    )
  },
}

/**
 * `renderOption` replaces a row's insides and keeps its semantics, selected
 * state and keyboard behaviour. The row is still a `role="option"`.
 */
export const CustomRows: Story = {
  render: () => (
    <div style={{ width: 340 }}>
      <Combobox
        fullWidth
        placeholder="Pick a branch"
        options={[
          { value: 'main', label: 'main', description: 'default' },
          { value: 'next', label: 'next', description: '12 ahead' },
          { value: 'fix/thumb', label: 'fix/thumb', description: '3 behind' },
        ]}
        renderOption={(option, { selected }) => (
          <Stack direction="row" gap={2} align="center" style={{ width: '100%' }}>
            <IoGitBranchOutline aria-hidden />
            <Text variant="body" style={{ fontFamily: 'var(--may-font-mono)' }}>
              {option.label}
            </Text>
            <Text variant="caption-1" tone="secondary" style={{ marginInlineStart: 'auto' }}>
              {selected ? 'checked out' : option.description}
            </Text>
          </Stack>
        )}
      />
    </div>
  ),
}

/** `searchable={false}` makes it a listbox: the rows stay, the filtering goes. */
export const NotSearchable: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Combobox {...args} searchable={false} fullWidth placeholder="Pick one" />
    </div>
  ),
}

/** Disabled, and a row that cannot be chosen. */
export const Disabled: Story = {
  render: (args) => (
    <div style={{ width: 320, display: 'grid', gap: 'var(--may-space-3)' }}>
      <Combobox {...args} fullWidth disabled />
      <Combobox {...args} fullWidth defaultValue="swift" />
    </div>
  ),
}
