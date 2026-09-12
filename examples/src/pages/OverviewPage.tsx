import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  IconTile,
  Input,
  SegmentedControl,
  Stack,
  Switch,
  Text,
} from '@adit_firdaus/may-ui'
import { useState } from 'react'
import { IoColorPaletteOutline, IoPhonePortraitOutline, IoSparklesOutline } from 'react-icons/io5'
import { SettingsScreen } from '../../../src/examples/SettingsScreen'
import { AuthScreen } from '../../../src/examples/AuthScreen'
import { AnalyticsDashboardScreen } from '../../../src/examples/AnalyticsDashboardScreen'
import { SiteLink } from '../router'
import { CodeBlock } from '../CodeBlock'

const install = 'npm install @adit_firdaus/may-ui'

export default function OverviewPage({ openConfig }: { openConfig: () => void }) {
  const [pattern, setPattern] = useState<'settings' | 'auth' | 'analytics'>('settings')
  const Pattern = pattern === 'settings'
    ? SettingsScreen
    : pattern === 'auth'
      ? AuthScreen
      : AnalyticsDashboardScreen
  return (
    <div className="site-overview">
      <section className="site-hero">
        <div className="site-hero__copy">
          <Badge variant="tinted">React 19 · zero CSS imports</Badge>
          <h1 tabIndex={-1}>A design system that<br />feels native.</h1>
          <Text variant="title-3" tone="secondary">
            Apple-native shapes, real spring physics, and provider-first configuration for React.
          </Text>
          <div className="site-hero__actions">
            <Button asChild size="lg"><SiteLink href="/components">Explore components</SiteLink></Button>
            <Button size="lg" variant="gray" onClick={openConfig}>Customize live</Button>
          </div>
          <CodeBlock code={install} />
        </div>

        <div className="site-hero__demo" aria-label="Interactive May UI preview">
          <div className="site-demo-window">
            <div className="site-demo-window__bar"><span /><span /><span /><Text variant="caption-1">Settings</Text></div>
            <Stack gap={4}>
              <div className="site-demo-profile">
                <IconTile gradient="blue" size="lg">M</IconTile>
                <div><CardTitle>May UI</CardTitle><Text variant="footnote" tone="secondary">Provider-first design system</Text></div>
              </div>
              <Input defaultValue="Native by default" aria-label="Example input" />
              <SegmentedControl
                options={[{ label: 'Design', value: 'design' }, { label: 'Code', value: 'code' }]}
                defaultValue="design"
                aria-label="Preview mode"
              />
              <Switch defaultChecked>Follow system appearance</Switch>
              <Checkbox defaultChecked>Respect reduced motion</Checkbox>
              <Button fullWidth>Ship the interface</Button>
            </Stack>
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-section__heading">
          <Text variant="caption-1" tone="tint" weight="semibold">WHY MAY UI</Text>
          <h2>Web components, native instincts.</h2>
        </div>
        <div className="site-feature-grid">
          {[
            [<IoPhonePortraitOutline />, 'Adaptive by intent', 'One component reshapes honestly across phone and desktop instead of shrinking a desktop widget.'],
            [<IoSparklesOutline />, 'Motion with weight', 'Damped oscillators become CSS linear() curves, preserving native-feeling arrival and release.'],
            [<IoColorPaletteOutline />, 'Configuration as React', 'MayProvider owns typed tokens and component defaults. Components carry their own styles.'],
          ].map(([icon, title, copy]) => (
            <Card key={String(title)} padding="lg">
              <CardBody><Stack gap={4}><IconTile gradient="blue">{icon}</IconTile><CardTitle>{title}</CardTitle><Text tone="secondary">{copy}</Text></Stack></CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="site-section site-section--split">
        <div>
          <Text variant="caption-1" tone="tint" weight="semibold">91 COMPONENTS</Text>
          <h2>Every part, in context.</h2>
          <Text tone="secondary">Browse adaptive foundations, purpose-built desktop shapes, and mobile interactions with live props and provider defaults.</Text>
          <Button asChild variant="tinted"><SiteLink href="/components">Open the catalog</SiteLink></Button>
        </div>
        <div className="site-component-mosaic">
          <Button>Button</Button><Button variant="tinted">Tinted</Button><Badge count={12} />
          <Switch defaultChecked aria-label="Enabled" /><Input placeholder="Search" />
          <SegmentedControl options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} defaultValue="a" aria-label="Choice" />
        </div>
      </section>

      <section className="site-section site-pattern-feature">
        <div className="site-pattern-feature__heading">
          <div>
            <Text variant="caption-1" tone="tint" weight="semibold">REAL PATTERNS</Text>
            <h2>More than isolated parts.</h2>
            <Text tone="secondary">Switch between complete May UI screens—the same compositions available in the pattern explorer.</Text>
          </div>
          <SegmentedControl
            options={[
              { label: 'Settings', value: 'settings' },
              { label: 'Sign in', value: 'auth' },
              { label: 'Analytics', value: 'analytics' },
            ]}
            value={pattern}
            onValueChange={(value) => setPattern(value as typeof pattern)}
            aria-label="Featured pattern"
          />
        </div>
        <div className={`site-pattern-feature__canvas site-pattern-feature__canvas--${pattern}`}>
          <Pattern />
        </div>
        <Button asChild variant="tinted"><SiteLink href={`/patterns/${pattern}`}>Inspect this pattern</SiteLink></Button>
      </section>

      <section className="site-final-cta">
        <h2>Configure once. Compose everywhere.</h2>
        <Text tone="secondary">Open the full provider lab, tune May UI, and copy production-ready React.</Text>
        <Button asChild size="lg"><SiteLink href="/playground">Launch playground</SiteLink></Button>
      </section>
    </div>
  )
}
