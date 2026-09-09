import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tag } from './Tag'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Data display/Tag',
  component: Tag,
  args: { children: 'design-system' },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <Stack direction="horizontal" gap={2} wrap>
      <Tag tone="neutral">neutral</Tag>
      <Tag tone="brand">brand</Tag>
      <Tag tone="success">success</Tag>
      <Tag tone="warning">warning</Tag>
      <Tag tone="danger">danger</Tag>
      <Tag tone="info">info</Tag>
    </Stack>
  ),
}

export const Removable: Story = {
  render: () => {
    const [tags, setTags] = useState(['react', 'typescript', 'css', 'a11y'])
    return (
      <Stack direction="horizontal" gap={2} wrap>
        {tags.map((tag) => (
          <Tag key={tag} tone="brand" onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
            {tag}
          </Tag>
        ))}
        {tags.length === 0 && <Tag tone="neutral">No filters</Tag>}
      </Stack>
    )
  },
}
