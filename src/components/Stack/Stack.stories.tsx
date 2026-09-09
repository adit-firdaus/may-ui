import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from './Stack'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

function Item({ children }: { children: ReactNode }) {
  return (
    <Box surface="subtle" padding={3} radius="md" bordered>
      <Text size="sm">{children}</Text>
    </Box>
  )
}

export const Vertical: Story = {
  render: (args) => (
    <Stack {...args} gap={3}>
      <Item>First</Item>
      <Item>Second</Item>
      <Item>Third</Item>
    </Stack>
  ),
}

export const Horizontal: Story = {
  render: (args) => (
    <Stack {...args} direction="horizontal" gap={3}>
      <Item>First</Item>
      <Item>Second</Item>
      <Item>Third</Item>
    </Stack>
  ),
}

export const GapScale: Story = {
  render: () => (
    <Stack gap={6}>
      {([1, 2, 4, 6, 8] as const).map((gap) => (
        <Stack key={gap} gap={2}>
          <Text size="xs" tone="subtle">gap={gap}</Text>
          <Stack direction="horizontal" gap={gap}>
            <Item>A</Item>
            <Item>B</Item>
            <Item>C</Item>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
}

export const Justify: Story = {
  render: () => (
    <Stack gap={4}>
      {(['start', 'center', 'end', 'between'] as const).map((justify) => (
        <Stack key={justify} direction="horizontal" gap={3} justify={justify} fullWidth>
          <Item>{justify}</Item>
          <Item>B</Item>
        </Stack>
      ))}
    </Stack>
  ),
}
