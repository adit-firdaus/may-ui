import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button'
import { Card, CardBody, CardTitle } from '../Card'
import { Stack } from '../Stack'
import { Text } from '../Text'
import { MayProvider } from '.'

const meta = {
  title: 'Foundations/MayProvider',
  component: MayProvider,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MayProvider>

export default meta
type Story = StoryObj<typeof meta>

export const NestedConfiguration: Story = {
  render: () => (
    <MayProvider
      theme={{
        mode: 'light',
        tokens: { radiusCard: '24px' },
        light: { colorPrimary: '#0066ff' },
      }}
      components={{ Button: { size: 'lg', variant: 'tinted' } }}
      inline
    >
      <Stack gap={4}>
        <Card>
          <CardBody>
            <Stack gap={3}>
              <CardTitle>Provider defaults</CardTitle>
              <Text tone="secondary">Large and tinted without local props.</Text>
              <Button>Inherited default</Button>
              <Button size="sm">Local size wins</Button>
            </Stack>
          </CardBody>
        </Card>

        <MayProvider
          theme={{ mode: 'dark', dark: { colorPrimary: '#4d8dff' } }}
          components={{ Button: { size: 'sm' } }}
          inline
        >
          <Card>
            <CardBody>
              <Stack gap={3}>
                <CardTitle>Nested dark scope</CardTitle>
                <Text tone="secondary">Small is local; tinted is inherited.</Text>
                <Button>Nested default</Button>
              </Stack>
            </CardBody>
          </Card>
        </MayProvider>
      </Stack>
    </MayProvider>
  ),
}
