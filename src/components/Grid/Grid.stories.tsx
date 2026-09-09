import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './Grid'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

const cells = Array.from({ length: 6 }, (_, i) => i + 1)

export const FixedColumns: Story = {
  render: () => (
    <Grid columns={3} gap={4}>
      {cells.map((n) => (
        <Box key={n} surface="subtle" padding={4} radius="md" bordered>
          <Text size="sm">Cell {n}</Text>
        </Box>
      ))}
    </Grid>
  ),
}

export const Responsive: Story = {
  render: () => (
    <Grid minColumnWidth="180px" gap={4}>
      {cells.map((n) => (
        <Box key={n} surface="subtle" padding={4} radius="md" bordered>
          <Text size="sm">Auto-fit {n}</Text>
        </Box>
      ))}
    </Grid>
  ),
}
