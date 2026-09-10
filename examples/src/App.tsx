import { useState } from 'react'
import { MayProvider, MayHost, Stack, Text, Switch, Badge } from 'mayui'
import { Sidebar, SidebarSection, SidebarItem } from 'mayui/desktop'
import { DeviceFrame, SCREENS, type ExampleScreen } from 'mayui/examples'

const GROUPS = [
  { key: 'phone', title: 'Phone' },
  { key: 'desktop', title: 'Desktop' },
  { key: 'cross', title: 'Cross-cutting' },
  { key: 'catalog', title: 'Catalogs' },
] as const

/**
 * The example gallery.
 *
 * Built entirely from May UI — the navigation is a real `Sidebar`, the theme
 * control is a real `Switch`. That is deliberate: if the chrome around the
 * examples feels wrong, the system is wrong, so the gallery is itself the
 * twenty-fifth example.
 */
export function App() {
  const [current, setCurrent] = useState<ExampleScreen>(SCREENS[0]!)
  const [dark, setDark] = useState(false)

  const Screen = current.component

  return (
    <MayProvider theme={dark ? 'dark' : 'light'}>
      <MayHost />
      <div style={{ display: 'flex', height: '100dvh', background: 'var(--may-color-bg)' }}>
        <Sidebar
          header={
            <Stack gap={1} style={{ padding: 'var(--may-space-2)' }}>
              <Text variant="headline">May UI</Text>
              <Text variant="caption-1" tone="secondary">
                {SCREENS.length} examples
              </Text>
            </Stack>
          }
          footer={
            <Switch
              checked={dark}
              onCheckedChange={setDark}
              description="Every example inherits the theme"
            >
              Dark appearance
            </Switch>
          }
        >
          {GROUPS.map((group) => {
            const items = SCREENS.filter((s) => s.group === group.key)
            if (!items.length) return null
            return (
              <SidebarSection key={group.key} title={group.title}>
                {items.map((screen) => (
                  <SidebarItem
                    key={screen.id}
                    icon={screen.icon}
                    active={screen.id === current.id}
                    onClick={() => setCurrent(screen)}
                    badge={screen.badge ? <Badge count={screen.badge} /> : undefined}
                  >
                    {screen.name}
                  </SidebarItem>
                ))}
              </SidebarSection>
            )
          })}
        </Sidebar>

        <main
          data-slot="scroll-area"
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            padding: current.frame ? 'var(--may-space-8)' : 0,
            display: current.frame ? 'flex' : 'block',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {/*
           * Phone screens go inside a DeviceFrame: it supplies the viewport,
           * the safe-area insets, and — critically — the containing block that
           * a fixed TabBar pins to. Desktop screens render full-bleed, because
           * Sidebar flyouts and CommandPalette need the real viewport.
           */}
          {current.frame ? (
            <DeviceFrame device={current.frame} label={current.name} theme={current.theme}>
              <Screen />
            </DeviceFrame>
          ) : (
            <Screen />
          )}
        </main>
      </div>
    </MayProvider>
  )
}
