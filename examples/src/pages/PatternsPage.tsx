import { useEffect, useMemo, useState } from 'react'
import { Button, MayProvider, SegmentedControl, Select, Stack, Text } from '@adit_firdaus/may-ui'
import { DeviceFrame, SCREENS } from '@adit_firdaus/may-ui/examples'
import { SiteLink } from '../router'

export default function PatternsPage({ slug }: { slug?: string }) {
  const initial = SCREENS.find((screen) => screen.id === slug) ?? SCREENS[0]!
  const [selectedId, setSelectedId] = useState(initial.id)
  const [device, setDevice] = useState<'phone' | 'phone-large' | 'tablet'>(initial.frame ?? 'phone')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(initial.theme ?? 'system')
  const selected = useMemo(() => SCREENS.find((screen) => screen.id === selectedId) ?? initial, [selectedId, initial])
  const Screen = selected.component

  useEffect(() => {
    const next = SCREENS.find((screen) => screen.id === slug)
    if (next) setSelectedId(next.id)
  }, [slug])

  return (
    <div className="site-patterns">
      <aside className="site-rail site-pattern-rail">
        <span className="site-rail__eyebrow">PATTERNS</span>
        {SCREENS.map((screen) => <SiteLink key={screen.id} className={screen.id === selected.id ? 'active' : ''} href={`/patterns/${screen.id}`} onClick={() => setSelectedId(screen.id)}>{screen.name}</SiteLink>)}
      </aside>
      <main className="site-pattern-main">
        <header className="site-pattern-toolbar">
          <div><Text variant="caption-1" tone="tint" weight="semibold">LIVE PATTERN</Text><h1 tabIndex={-1}>{selected.name}</h1></div>
          <Stack direction="row" gap={2} wrap>
            {selected.frame && <Select value={device} onChange={(event) => setDevice(event.currentTarget.value as typeof device)} options={[{ label: 'Phone', value: 'phone' }, { label: 'Large phone', value: 'phone-large' }, { label: 'Tablet', value: 'tablet' }]} aria-label="Device" />}
            <SegmentedControl options={[{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]} value={theme} onValueChange={setTheme} aria-label="Pattern theme" />
          </Stack>
        </header>
        <div className="site-pattern-stage">
          <MayProvider theme={{ mode: theme }} inline>
            {selected.frame ? <DeviceFrame device={device} label={selected.name}><Screen /></DeviceFrame> : <div className="site-pattern-desktop"><Screen /></div>}
          </MayProvider>
        </div>
        <div className="site-pattern-actions"><Button asChild variant="tinted"><SiteLink href="/components">Browse components</SiteLink></Button></div>
      </main>
    </div>
  )
}
