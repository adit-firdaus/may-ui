import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from '../components/Stack/Stack'
import { Grid } from '../components/Grid/Grid'
import { Box } from '../components/Box/Box'
import { Text } from '../components/Text/Text'
import { Heading } from '../components/Heading/Heading'

const meta = {
  title: 'Foundation/Design tokens',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Swatch({ token }: { token: string }) {
  return (
    <Stack gap={2}>
      <div
        style={{
          height: 52,
          borderRadius: 'var(--may-radius-md)',
          background: `var(${token})`,
          border: '1px solid var(--may-color-border)',
        }}
      />
      <Text size="xs" mono tone="muted">
        {token}
      </Text>
    </Stack>
  )
}

const semanticColors = [
  '--may-color-bg',
  '--may-color-surface',
  '--may-color-surface-sunken',
  '--may-color-border',
  '--may-color-brand',
  '--may-color-brand-subtle',
  '--may-color-success',
  '--may-color-warning',
  '--may-color-danger',
  '--may-color-info',
]

/** The semantic layer — what you build with. */
export const Colors: Story = {
  render: () => (
    <Stack gap={5}>
      <Heading level={2}>Semantic colours</Heading>
      <Text tone="muted">
        Override these to restyle the whole system. The raw ramps underneath (
        <Text as="span" mono size="sm">--may-brand-500</Text> and friends) are rarely used directly.
      </Text>
      <Grid minColumnWidth="160px" gap={4}>
        {semanticColors.map((token) => (
          <Swatch key={token} token={token} />
        ))}
      </Grid>
    </Stack>
  ),
}

/** The 4px spacing scale, used by every `gap` and `padding` prop. */
export const Spacing: Story = {
  render: () => (
    <Stack gap={5}>
      <Heading level={2}>Spacing</Heading>
      <Stack gap={2}>
        {([1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const).map((step) => (
          <Stack key={step} direction="horizontal" gap={4} align="center">
            <Text size="xs" mono tone="muted" style={{ width: 130 }}>
              --may-space-{step}
            </Text>
            <div
              style={{
                height: 16,
                width: `var(--may-space-${step})`,
                background: 'var(--may-color-brand)',
                borderRadius: 'var(--may-radius-sm)',
              }}
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
}

/** Type scale, weights and the mono face. */
export const Typography: Story = {
  render: () => (
    <Stack gap={5}>
      <Heading level={2}>Typography</Heading>
      <Stack gap={3}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Stack key={size} direction="horizontal" gap={4} align="baseline">
            <Text size="xs" mono tone="muted" style={{ width: 130 }}>
              --may-font-size-{size}
            </Text>
            <Text size={size}>The quick brown fox jumps over the lazy dog</Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
}

/** Corner radii and elevation. */
export const RadiusAndElevation: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={4}>
        <Heading level={2}>Radius</Heading>
        <Stack direction="horizontal" gap={4} wrap>
          {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((radius) => (
            <Stack key={radius} gap={2} align="center">
              <Box surface="base" bordered radius={radius} style={{ width: 72, height: 72 }} />
              <Text size="xs" mono tone="muted">{radius}</Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack gap={4}>
        <Heading level={2}>Elevation</Heading>
        <Stack direction="horizontal" gap={5} wrap>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((shadow) => (
            <Stack key={shadow} gap={2} align="center">
              <Box surface="base" radius="lg" shadow={shadow} style={{ width: 72, height: 72 }} />
              <Text size="xs" mono tone="muted">{shadow}</Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
}
