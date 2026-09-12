import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Field,
  Input,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  Stepper,
  Switch,
  Text,
  Textarea,
  toast,
} from '@adit_firdaus/may-ui'
import type { MayPlatform, MayThemeMode } from '@adit_firdaus/may-ui'
import catalogData from './generated/catalog-index.json'
import type { CatalogControl, CatalogSummary, SiteProviderConfig } from './site-types'
import { stableStringify } from './lib/config-codec.mjs'
import { useSiteConfig, validateConfig } from './site-config'

const catalog = catalogData as CatalogSummary[]
const modes = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]
const platforms = [
  { label: 'Auto', value: 'auto' },
  { label: 'Phone', value: 'phone' },
  { label: 'Desktop', value: 'desktop' },
]

const tokenGroups = [
  {
    title: 'Brand & surfaces',
    controls: [
      ['colorTint', 'Tint', '#007aff', 'color'],
      ['colorPrimary', 'Primary', '#007aff', 'color'],
      ['colorBg', 'Background', '#f2f2f7', 'color'],
      ['colorSurface', 'Surface', '#ffffff', 'color'],
      ['colorText', 'Text', '#000000', 'color'],
    ],
  },
  {
    title: 'Shape & density',
    controls: [
      ['controlH', 'Control height', '2.75rem', 'text'],
      ['radiusMd', 'Medium radius', '10px', 'text'],
      ['radiusLg', 'Large radius', '12px', 'text'],
      ['radiusCard', 'Card radius', '16px', 'text'],
      ['radiusSheet', 'Sheet radius', '20px', 'text'],
    ],
  },
  {
    title: 'Typography & motion',
    controls: [
      ['fontSans', 'Font family', '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', 'text'],
      ['textBody', 'Body size', '1.0625rem', 'text'],
      ['durationFast', 'Fast duration', '150ms', 'text'],
      ['durationSettle', 'Settle duration', '340ms', 'text'],
    ],
  },
] as const

const numericDefaults: Record<string, number> = {
  columns: 2,
  delay: 500,
  duration: 4000,
  lines: 1,
  max: 100,
  maxRecent: 5,
  min: 0,
  offset: 8,
  pageSize: 10,
  rowHeight: 44,
  siblingCount: 1,
  speed: 44,
  spokes: 8,
  step: 1,
}
const controlValue = (control: CatalogControl, value: unknown) =>
  value ?? control.defaultValue ?? (control.kind === 'boolean'
    ? false
    : control.kind === 'number'
      ? numericDefaults[control.prop] ?? 1
      : '')

const channel = (value: string, offset: number) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255
const luminance = (value: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null
  const linear = [channel(value, 1), channel(value, 3), channel(value, 5)]
    .map((item) => item <= .03928 ? item / 12.92 : ((item + .055) / 1.055) ** 2.4)
  return .2126 * linear[0]! + .7152 * linear[1]! + .0722 * linear[2]!
}
const contrast = (left: string, right: string) => {
  const a = luminance(left)
  const b = luminance(right)
  return a === null || b === null ? null : (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}

function PropControl({
  control,
  value,
  onChange,
  onClear,
}: {
  control: CatalogControl
  value: unknown
  onChange: (value: unknown) => void
  onClear: () => void
}) {
  const resolved = controlValue(control, value)
  return (
    <div className="site-control-row">
      <div className="site-control-label">
        <Text variant="footnote" weight="medium">{control.prop}</Text>
        {value !== undefined && <button className="site-link-button" onClick={onClear}>Use global</button>}
      </div>
      {control.kind === 'boolean' ? (
        <Switch
          checked={Boolean(resolved)}
          onCheckedChange={onChange}
          aria-label={control.prop}
        />
      ) : control.kind === 'enum' && control.options.length <= 4 ? (
        <SegmentedControl
          size="sm"
          options={control.options.map((option) => ({ label: option, value: option }))}
          value={String(resolved)}
          onValueChange={onChange}
          aria-label={control.prop}
        />
      ) : control.kind === 'enum' ? (
        <Select
          size="sm"
          value={String(resolved)}
          options={control.options.map((option) => ({ label: option, value: option }))}
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-label={control.prop}
        />
      ) : control.kind === 'number' ? (
        <div className="site-number-control">
          <Slider
            value={Number(resolved)}
            min={0}
            max={Math.max(10, Number(resolved) * 2)}
            onValueChange={onChange}
            aria-label={control.prop}
          />
          <Stepper value={Number(resolved)} onValueChange={onChange} aria-label={`${control.prop} exact value`} size="sm" />
        </div>
      ) : (
        <Input
          size="sm"
          value={String(resolved)}
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-label={control.prop}
        />
      )}
    </div>
  )
}

export function Configurator({ compact = false, onDone }: { compact?: boolean; onDone?: () => void }) {
  const { config, setConfig, reset } = useSiteConfig()
  const [componentName, setComponentName] = useState('Button')
  const [componentFilter, setComponentFilter] = useState('')
  const [json, setJson] = useState(() => JSON.stringify(config, null, 2))
  const [errors, setErrors] = useState<string[]>([])
  const entry = useMemo(() => catalog.find((item) => item.name === componentName), [componentName])
  const providerControls = entry?.controls.filter((control) => control.providerDefault) ?? []
  const textColor = String(config.theme?.tokens?.colorText ?? '#000000')
  const backgroundColor = String(config.theme?.tokens?.colorBg ?? '#f2f2f7')
  const primaryColor = String(config.theme?.tokens?.colorPrimary ?? '#007aff')
  const textContrast = contrast(textColor, backgroundColor)
  const primaryContrast = contrast(primaryColor, '#ffffff')
  const colorsCustomized = (['colorText', 'colorBg', 'colorPrimary'] as const)
    .some((name) => config.theme?.tokens?.[name] !== undefined)

  useEffect(() => setJson(JSON.stringify(config, null, 2)), [config])

  const setTheme = (theme: SiteProviderConfig['theme']) => setConfig({ ...config, theme })
  const setToken = (name: string, value: string) => setTheme({
    ...config.theme,
    mode: config.theme?.mode ?? 'system',
    tokens: { ...config.theme?.tokens, [name]: value },
  })
  const setProviderDefault = (name: string, prop: string, value: unknown) => {
    const components = config.components as Record<string, Record<string, unknown>> | undefined
    setConfig({
      ...config,
      components: {
        ...components,
        [name]: { ...components?.[name], [prop]: value },
      },
    } as SiteProviderConfig)
  }
  const clearProviderDefault = (name: string, prop: string) => {
    const components = { ...(config.components as Record<string, Record<string, unknown>> | undefined) }
    const defaults = { ...components[name] }
    delete defaults[prop]
    if (Object.keys(defaults).length) components[name] = defaults
    else delete components[name]
    setConfig({ ...config, components } as SiteProviderConfig)
  }
  const applyJson = () => {
    try {
      const parsed = JSON.parse(json)
      const result = validateConfig(parsed)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      setErrors([])
      setConfig(result.value as SiteProviderConfig)
      toast.success('Configuration applied')
    } catch {
      setErrors(['JSON is not valid'])
    }
  }

  return (
    <div className={compact ? 'site-config site-config--compact' : 'site-config'}>
      <header className="site-config__header">
        <div>
          <Text variant="headline">Live configuration</Text>
          <Text variant="caption-1" tone="secondary">Changes apply to the entire site.</Text>
        </div>
        <div className="site-config__header-actions">
          <Button size="sm" variant="plain" tone="danger" onClick={reset}>Reset</Button>
          {onDone && <Button size="sm" variant="gray" onClick={onDone}>Done</Button>}
        </div>
      </header>

      <Stack gap={5}>
        <section className="site-config__section">
          <Text variant="subheadline" weight="semibold">Appearance</Text>
          <Field label="Theme mode">
            <SegmentedControl
              size="sm"
              fullWidth
              options={modes}
              value={config.theme?.mode ?? 'system'}
              onValueChange={(mode) => setTheme({ ...config.theme, mode: mode as MayThemeMode })}
              aria-label="Theme mode"
            />
          </Field>
          <Field label="Platform">
            <SegmentedControl
              size="sm"
              fullWidth
              options={platforms}
              value={config.platform ?? 'auto'}
              onValueChange={(platform) => setConfig({ ...config, platform: platform as MayPlatform })}
              aria-label="Platform"
            />
          </Field>
        </section>

        {tokenGroups.map((group) => (
          <section className="site-config__section" key={group.title}>
            <Text variant="subheadline" weight="semibold">{group.title}</Text>
            {group.controls.map(([name, label, fallback, kind]) => {
              const value = String(config.theme?.tokens?.[name] ?? fallback)
              return (
                <Field key={name} label={label}>
                  <div className="site-token-input">
                    {kind === 'color' && (
                      <input
                        className="site-color-input"
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(value) ? value : fallback}
                        onChange={(event) => setToken(name, event.currentTarget.value)}
                        aria-label={`${label} color`}
                      />
                    )}
                    <Input
                      size="sm"
                      value={value}
                      onChange={(event) => setToken(name, event.currentTarget.value)}
                    />
                  </div>
                </Field>
              )
            })}
          </section>
        ))}

        {colorsCustomized && (textContrast !== null && textContrast < 4.5 || primaryContrast !== null && primaryContrast < 4.5) && (
          <div className="site-contrast-warning" role="status">
            <Text variant="footnote" weight="semibold" style={{ color: 'var(--may-color-warning)' }}>Contrast warning</Text>
            <Text variant="caption-1" tone="secondary">
              One configured color pair is below 4.5:1. Preview it, but do not ship it for body text.
            </Text>
          </div>
        )}

        <section className="site-config__section">
          <Text variant="subheadline" weight="semibold">Font preset</Text>
          <Select
            size="sm"
            value="custom"
            options={[
              { label: 'Choose preset…', value: 'custom' },
              { label: 'System', value: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
              { label: 'Rounded', value: 'ui-rounded, -apple-system, system-ui, sans-serif' },
              { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
            ]}
            onChange={(event) => event.currentTarget.value !== 'custom' && setToken('fontSans', event.currentTarget.value)}
            aria-label="Font preset"
          />
        </section>

        <section className="site-config__section">
          <Text variant="subheadline" weight="semibold">Component defaults</Text>
          <Input
            size="sm"
            value={componentFilter}
            onChange={(event) => setComponentFilter(event.currentTarget.value)}
            placeholder="Search configurable components…"
            aria-label="Search configurable components"
          />
          <Select
            size="sm"
            value={componentName}
            options={catalog.filter((item) =>
              item.controls.some((control) => control.providerDefault) &&
              item.name.toLowerCase().includes(componentFilter.toLowerCase()))
              .map((item) => ({ label: item.name, value: item.name }))}
            onChange={(event) => setComponentName(event.currentTarget.value)}
            aria-label="Configurable component"
          />
          {providerControls.length ? providerControls.map((control) => (
            <PropControl
              key={control.prop}
              control={control}
              value={(config.components as Record<string, Record<string, unknown>> | undefined)?.[componentName]?.[control.prop]}
              onChange={(value) => setProviderDefault(componentName, control.prop, value)}
              onClear={() => clearProviderDefault(componentName, control.prop)}
            />
          )) : <Text variant="footnote" tone="secondary">No global defaults for this component.</Text>}
        </section>

        <section className="site-config__section">
          <Text variant="subheadline" weight="semibold">Toast host</Text>
          <Field label="Position">
            <Select
              size="sm"
              value={config.host === false ? 'disabled' : config.host?.position ?? 'top-end'}
              options={[
                { label: 'Disabled', value: 'disabled' },
                { label: 'Top start', value: 'top-start' },
                { label: 'Top center', value: 'top-center' },
                { label: 'Top end', value: 'top-end' },
                { label: 'Bottom center', value: 'bottom-center' },
              ]}
              onChange={(event) => setConfig({
                ...config,
                host: event.currentTarget.value === 'disabled'
                  ? false
                  : { ...(config.host || {}), position: event.currentTarget.value as 'top-end' },
              })}
            />
          </Field>
          {config.host !== false && (
            <>
              <Field label="Maximum visible">
                <Stepper
                  size="sm"
                  min={1}
                  max={8}
                  value={config.host?.max ?? 3}
                  onValueChange={(max) => setConfig({ ...config, host: { ...config.host, max } })}
                  aria-label="Maximum visible toasts"
                />
              </Field>
              <Field label="Duration (ms)">
                <Stepper
                  size="sm"
                  min={0}
                  step={500}
                  value={config.host?.duration ?? 4000}
                  onValueChange={(duration) => setConfig({ ...config, host: { ...config.host, duration } })}
                  aria-label="Toast duration"
                />
              </Field>
            </>
          )}
        </section>

        {!compact && (
          <section className="site-config__section">
            <Text variant="subheadline" weight="semibold">Advanced JSON</Text>
            <Textarea rows={12} value={json} onChange={(event) => setJson(event.currentTarget.value)} />
            {errors.length > 0 && (
              <ul className="site-config-errors">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
            )}
            <div className="site-config-actions">
              <Button size="sm" onClick={applyJson}>Apply JSON</Button>
              <Button
                size="sm"
                variant="gray"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href)
                  toast.success('Share link copied')
                }}
              >
                Copy share link
              </Button>
            </div>
          </section>
        )}
      </Stack>

      <output className="site-config__summary" aria-live="polite">
        {stableStringify(config) === stableStringify({ theme: { mode: 'system' } })
          ? 'Using May UI defaults'
          : 'Custom provider configuration active'}
      </output>
    </div>
  )
}

export { PropControl }
