import { useEffect, useState } from 'react'
import {
  MayProvider,
  MayHost,
  Stack,
  Text,
  Switch,
  Badge,
  Button,
  Sheet,
  List,
  ListRow,
  Toolbar,
  useIsDesktop,
} from '@adit_firdaus/may-ui'
import { Sidebar, SidebarSection, SidebarItem } from '@adit_firdaus/may-ui/desktop'
import { DeviceFrame, SCREENS, type ExampleScreen } from '@adit_firdaus/may-ui/examples'

/** Injected by Vite from the library's package.json. See vite.config.ts. */
declare const __MAY_VERSION__: string

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
 *
 * It is also adaptive, for the same reason. A 242px sidebar beside a phone
 * viewport leaves about 130px for the example itself, which is not a smaller
 * version of the gallery — it is a broken one. So the shell takes the shape the
 * width can carry: a sidebar on a desktop, a bar and a sheet on a phone. The
 * breakpoint comes from `useIsDesktop`, which reads it out of the token layer,
 * so this can never disagree with the components' own media queries.
 */
export function App() {
  const [current, setCurrent] = useState<ExampleScreen>(SCREENS[0]!)
  const [dark, setDark] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const isDesktop = useIsDesktop()

  /*
   * Widening the window puts the list back in the sidebar, so the sheet holding
   * that same list has no reason to exist — and if its open flag survived the
   * crossing, narrowing again would reopen a sheet nobody asked for. Which is
   * exactly what happened before this line.
   */
  useEffect(() => {
    if (isDesktop) setNavOpen(false)
  }, [isDesktop])

  const Screen = current.component

  const themeSwitch = (
    <Switch
      checked={dark}
      onCheckedChange={setDark}
      description="Every example inherits the theme"
    >
      Dark appearance
    </Switch>
  )

  const pick = (screen: ExampleScreen) => {
    setCurrent(screen)
    setNavOpen(false)
  }

  return (
    <MayProvider theme={dark ? 'dark' : 'light'}>
      <MayHost />
      <div style={{ display: 'flex', height: '100dvh', background: 'var(--may-color-bg)' }}>
        {isDesktop && (
          <Sidebar
            header={
              <Stack gap={1} style={{ padding: 'var(--may-space-2)' }}>
                <Text variant="headline">May UI</Text>
                <Text variant="caption-1" tone="secondary">
                  v{__MAY_VERSION__} · {SCREENS.length} examples
                </Text>
              </Stack>
            }
            footer={themeSwitch}
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
                      onClick={() => pick(screen)}
                      badge={screen.badge ? <Badge count={screen.badge} /> : undefined}
                    >
                      {screen.name}
                    </SidebarItem>
                  ))}
                </SidebarSection>
              )
            })}
          </Sidebar>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {/*
           * The phone shell. A Toolbar rather than a NavigationBar: the compact
           * nav bar floats over its content by design, and this one has to hold
           * a row open above the example rather than sit on top of it.
           */}
          {!isDesktop && (
            <Toolbar placement="top" sticky align="between" variant="surface" safeArea>
              <Button variant="plain" size="md" onClick={() => setNavOpen(true)}>
                Examples
              </Button>
              <Text variant="headline">{current.name}</Text>
              <Button variant="plain" size="md" onClick={() => setDark(!dark)}>
                {dark ? 'Light' : 'Dark'}
              </Button>
            </Toolbar>
          )}

          <main
            data-slot="scroll-area"
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'auto',
              /*
               * The device frame is a desktop affordance: it exists to show a
               * phone screen on a wide display. On an actual phone the viewport
               * IS the frame, so the example runs full-bleed and gets the whole
               * width instead of a picture of a phone inside a phone.
               */
              padding: isDesktop && current.frame ? 'var(--may-space-8)' : 0,
              display: isDesktop && current.frame ? 'flex' : 'block',
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
            {isDesktop && current.frame ? (
              <DeviceFrame device={current.frame} label={current.name} theme={current.theme}>
                <Screen />
              </DeviceFrame>
            ) : (
              <Screen />
            )}
          </main>
        </div>

        {/*
         * The same list, in the shape a phone can hold. A Sheet of ListRows
         * rather than the Sidebar itself: a sidebar is a desktop object, and
         * squeezing one into a drawer would be the port-shaped mistake this
         * system exists to avoid.
         */}
        <Sheet
          open={!isDesktop && navOpen}
          onClose={() => setNavOpen(false)}
          title="Examples"
          size="lg"
        >
            <Stack gap={4} style={{ paddingBlockEnd: 'var(--may-space-6)' }}>
              {GROUPS.map((group) => {
                const items = SCREENS.filter((s) => s.group === group.key)
                if (!items.length) return null
                return (
                  <List key={group.key} header={group.title}>
                    {items.map((screen) => (
                      <ListRow
                        key={screen.id}
                        leading={screen.icon}
                        title={screen.name}
                        detail={screen.id === current.id ? 'Current' : undefined}
                        accessory={screen.badge ? <Badge count={screen.badge} /> : undefined}
                        onClick={() => pick(screen)}
                      />
                    ))}
                  </List>
                )
              })}
            <div style={{ padding: '0 var(--may-space-4)' }}>{themeSwitch}</div>
            {/* The sidebar never renders on a phone, so the version lives here
              * too — otherwise it would be invisible on the device most likely
              * to be asking which build it is looking at. */}
            <Text variant="caption-1" tone="secondary" style={{ padding: '0 var(--may-space-4)' }}>
              May UI v{__MAY_VERSION__}
            </Text>
          </Stack>
        </Sheet>
      </div>
    </MayProvider>
  )
}
