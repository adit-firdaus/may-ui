import type { Meta, StoryObj } from '@storybook/react'
import { Box } from './Box'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'

const meta = {
  title: 'Layout/Box',
  component: Box,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    padding: 4,
    surface: 'base',
    radius: 'lg',
    bordered: true,
    children: <Text>A surface with token-bound padding, radius and border.</Text>,
  },
}

export const Surfaces: Story = {
  render: () => (
    <Stack gap={3}>
      {(['base', 'raised', 'sunken', 'subtle'] as const).map((surface) => (
        <Box key={surface} surface={surface} padding={4} radius="md" bordered>
          <Text size="sm">surface="{surface}"</Text>
        </Box>
      ))}
    </Stack>
  ),
}

export const Elevation: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4} wrap>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((shadow) => (
        <Box key={shadow} surface="base" padding={4} radius="lg" shadow={shadow}>
          <Text size="sm">shadow="{shadow}"</Text>
        </Box>
      ))}
    </Stack>
  ),
}
