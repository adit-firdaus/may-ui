import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './Heading'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  args: { children: 'Design tokens' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Levels: Story = {
  render: () => (
    <Stack gap={4}>
      <Heading level={1}>Level 1 — page title</Heading>
      <Heading level={2}>Level 2 — section</Heading>
      <Heading level={3}>Level 3 — subsection</Heading>
      <Heading level={4}>Level 4 — group</Heading>
      <Heading level={5}>Level 5 — label</Heading>
    </Stack>
  ),
}

export const SizeIndependentOfLevel: Story = {
  render: () => (
    <Stack gap={3}>
      <Heading level={2} size="2xl">An h2 that looks like an h1</Heading>
      <Heading level={1} size="md">An h1 that looks small</Heading>
    </Stack>
  ),
}
