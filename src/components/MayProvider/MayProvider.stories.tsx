import type { Meta, StoryObj } from '@storybook/react'
import { MayProvider, useMayTheme } from './MayProvider'
import { Button } from '../Button/Button'
import { Card, CardTitle } from '../Card/Card'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Badge } from '../Badge/Badge'

const meta = {
  title: 'Foundation/MayProvider',
  component: MayProvider,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MayProvider>

export default meta
type Story = StoryObj<typeof meta>

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useMayTheme()
  return (
    <Card>
      <CardTitle>Theme</CardTitle>
      <Text tone="muted" size="sm">
        Selected: <strong>{theme}</strong> · resolved: <Badge tone="brand">{resolvedTheme}</Badge>
      </Text>
      <Stack direction="horizontal" gap={2}>
        <Button size="sm" variant={theme === 'light' ? 'solid' : 'outline'} tone={theme === 'light' ? 'brand' : 'neutral'} onClick={() => setTheme('light')}>Light</Button>
        <Button size="sm" variant={theme === 'dark' ? 'solid' : 'outline'} tone={theme === 'dark' ? 'brand' : 'neutral'} onClick={() => setTheme('dark')}>Dark</Button>
        <Button size="sm" variant={theme === 'system' ? 'solid' : 'outline'} tone={theme === 'system' ? 'brand' : 'neutral'} onClick={() => setTheme('system')}>System</Button>
      </Stack>
    </Card>
  )
}

/**
 * A nested provider owns its own theme, so a single region can be pinned dark
 * inside an otherwise light page.
 */
export const NestedThemes: Story = {
  render: () => (
    <Stack gap={4}>
      <MayProvider theme="light" inline>
        <div style={{ padding: 16, borderRadius: 12 }}>
          <ThemeSwitcher />
        </div>
      </MayProvider>
      <MayProvider theme="dark" inline>
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--may-color-bg)' }}>
          <ThemeSwitcher />
        </div>
      </MayProvider>
    </Stack>
  ),
}
