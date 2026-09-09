import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from './Card'
import { Button } from '../Button/Button'
import { Badge } from '../Badge/Badge'
import { Text } from '../Text/Text'
import { Grid } from '../Grid/Grid'

const meta = {
  title: 'Layout/Card',
  component: Card,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args}>
        <CardHeader>
          <div>
            <CardTitle>Production deploy</CardTitle>
            <CardDescription>Triggered 4 minutes ago by the release pipeline.</CardDescription>
          </div>
          <Badge tone="success" dot>Live</Badge>
        </CardHeader>
        <CardBody>
          <Text tone="muted">
            All 14 health checks passed. Traffic has been shifted to the new revision.
          </Text>
        </CardBody>
        <CardFooter>
          <Button variant="outline" tone="neutral">View logs</Button>
          <Button>Promote</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <Grid minColumnWidth="220px" gap={4}>
      <Card variant="outline">
        <CardTitle>Outline</CardTitle>
        <Text tone="muted" size="sm">The default — a bordered surface.</Text>
      </Card>
      <Card variant="raised">
        <CardTitle>Raised</CardTitle>
        <Text tone="muted" size="sm">Elevation instead of a border.</Text>
      </Card>
      <Card variant="plain">
        <CardTitle>Plain</CardTitle>
        <Text tone="muted" size="sm">No surface at all.</Text>
      </Card>
    </Grid>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Grid minColumnWidth="200px" gap={4}>
      {['Analytics', 'Billing', 'Members'].map((name) => (
        <Card key={name} interactive padding="md">
          <CardTitle>{name}</CardTitle>
          <Text tone="muted" size="sm">Open the {name.toLowerCase()} settings.</Text>
        </Card>
      ))}
    </Grid>
  ),
}
