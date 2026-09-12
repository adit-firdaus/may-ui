import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  EmptyState,
  Input,
  SegmentedControl,
  Select,
  Tag,
  Text,
} from '@adit_firdaus/may-ui'
import catalogData from '../generated/catalog.json'
import type { CatalogControl, CatalogEntry } from '../site-types'
import { decodeState, encodeState, generateReactCode, stableStringify } from '../lib/config-codec.mjs'
import { replaceSearch, SiteLink, useRoute } from '../router'
import { useSiteConfig, DEFAULT_SITE_CONFIG } from '../site-config'
import { PropControl } from '../Configurator'
import { PreviewRenderer, previewCodeProps, VariantMatrix } from '../catalog/PreviewRenderer'
import { CodeBlock } from '../CodeBlock'

const catalog = catalogData as CatalogEntry[]
const families = ['all', 'adaptive', 'desktop', 'mobile'] as const

const readLocalProps = (encoded: string | null) => {
  if (!encoded) return {}
  try {
    const value = decodeState(encoded)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}

export default function ComponentsPage({ slug }: { slug?: string }) {
  const route = useRoute()
  const { config } = useSiteConfig()
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<(typeof families)[number]>('all')
  const [category, setCategory] = useState('all')
  const [capability, setCapability] = useState('all')
  const [width, setWidth] = useState('wide')
  const [localProps, setLocalProps] = useState<Record<string, unknown>>(() => readLocalProps(route.search.get('props')))
  const entry = catalog.find((item) => item.slug === slug)

  useEffect(() => setLocalProps(readLocalProps(new URLSearchParams(window.location.search).get('props'))), [slug])
  useEffect(() => {
    const reset = () => setLocalProps({})
    window.addEventListener('may-site:reset', reset)
    return () => window.removeEventListener('may-site:reset', reset)
  }, [])
  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    if (Object.keys(localProps).length) search.set('props', encodeState(localProps))
    else search.delete('props')
    replaceSearch(search)
  }, [localProps])

  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category))].sort(), [])
  const filtered = catalog.filter((item) =>
    (family === 'all' || item.family === family) &&
    (category === 'all' || item.category === category) &&
    (capability === 'all' ||
      capability === 'configurable' && item.controls.some((control) => control.providerDefault) ||
      capability === 'interactive' && item.controls.length > 0 ||
      capability === 'stateful' && item.controls.some((control) => control.kind === 'boolean') ||
      capability === 'data' && item.props.some((prop) => ['items', 'options', 'data', 'columns'].includes(prop.name))) &&
    `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  )

  if (!entry && slug) return <EmptyState title="Component not found" action={<Button asChild><SiteLink href="/components">Back to catalog</SiteLink></Button>} />

  if (!entry) return (
    <main className="site-catalog-index">
      <header className="site-page-heading">
        <Text variant="caption-1" tone="tint" weight="semibold">COMPONENT CATALOG</Text>
        <h1 tabIndex={-1}>Every building block.</h1>
        <Text tone="secondary">Search 91 adaptive, desktop, and mobile components. Open any entry for live controls, API, and copy-ready React.</Text>
      </header>
      <div className="site-catalog-tools">
        <Input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search components…" aria-label="Search components" />
        <SegmentedControl options={families.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))} value={family} onValueChange={setFamily} aria-label="Component family" />
        <Select value={category} onChange={(event) => setCategory(event.currentTarget.value)} options={[{ label: 'All categories', value: 'all' }, ...categories.map((value) => ({ label: value, value }))]} aria-label="Category" />
        <Select value={capability} onChange={(event) => setCapability(event.currentTarget.value)} options={[
          { label: 'All capabilities', value: 'all' },
          { label: 'Provider configurable', value: 'configurable' },
          { label: 'Interactive controls', value: 'interactive' },
          { label: 'Stateful', value: 'stateful' },
          { label: 'Data driven', value: 'data' },
        ]} aria-label="Capability" />
      </div>
      <div className="site-catalog-grid">
        {filtered.map((item) => (
          <SiteLink className="site-catalog-card" href={`/components/${item.slug}`} key={item.slug}>
            <div className="site-catalog-card__meta"><Tag size="sm">{item.family}</Tag><span>{item.category}</span></div>
            <h2>{item.name}</h2><p>{item.description}</p>
            <span className="site-catalog-card__arrow">View component →</span>
          </SiteLink>
        ))}
      </div>
    </main>
  )

  const globalDefaults = (config.components as Record<string, Record<string, unknown>> | undefined)?.[entry.name] ?? {}
  const codeConfig = stableStringify(config) === stableStringify(DEFAULT_SITE_CONFIG) ? {} : config
  const code = generateReactCode(codeConfig, previewCodeProps(entry, localProps))
  const related = catalog.filter((item) => item.category === entry.category && item.name !== entry.name).slice(0, 4)

  return (
    <main className="site-component-page">
      <div className="site-component-breadcrumb"><SiteLink href="/components">Components</SiteLink><span>/</span><span>{entry.name}</span></div>
      <header className="site-page-heading site-page-heading--compact">
        <div className="site-component-title"><div><Text variant="caption-1" tone="tint" weight="semibold">{entry.family.toUpperCase()} · {entry.category.toUpperCase()}</Text><h1 tabIndex={-1}>{entry.name}</h1></div><Tag>{entry.importPath}</Tag></div>
        <Text tone="secondary">{entry.description}</Text>
      </header>

      <section className="site-component-workbench">
        <div className="site-preview-column">
          <div className="site-preview-toolbar">
            <Text variant="subheadline" weight="semibold">Preview</Text>
            <SegmentedControl size="sm" options={[{ label: 'Phone', value: 'phone' }, { label: 'Tablet', value: 'tablet' }, { label: 'Wide', value: 'wide' }]} value={width} onValueChange={setWidth} aria-label="Preview width" />
          </div>
          <div className={`site-preview site-preview--${width} site-preview-family-${entry.family}`}><PreviewRenderer entry={entry} props={localProps} /></div>
        </div>
        <aside className="site-local-controls">
          <Text variant="headline">Example props</Text>
          <Text variant="footnote" tone="secondary">Local values override provider defaults. Clear one to inherit.</Text>
          {entry.controls.length ? entry.controls.map((control: CatalogControl) => (
            <PropControl
              key={control.prop}
              control={{
                ...control,
                defaultValue: ['string', 'number', 'boolean'].includes(typeof globalDefaults[control.prop])
                  ? globalDefaults[control.prop] as string | number | boolean
                  : control.defaultValue,
              }}
              value={localProps[control.prop]}
              onChange={(value) => setLocalProps((current) => ({ ...current, [control.prop]: value }))}
              onClear={() => setLocalProps((current) => { const next = { ...current }; delete next[control.prop]; return next })}
            />
          )) : <Text tone="secondary">This component has no safe primitive controls.</Text>}
          <Button size="sm" variant="gray" onClick={() => setLocalProps({})}>Clear local props</Button>
        </aside>
      </section>

      <section className="site-detail-section"><h2>React</h2><CodeBlock code={code} /></section>
      <section className="site-detail-section"><h2>Variants and states</h2><VariantMatrix entry={entry} /><Text tone="secondary">Use the live controls above for interactive and provider-inherited states.</Text></section>
      <section className="site-detail-section"><h2>Usage and accessibility</h2><Text>{entry.description}</Text><Text tone="secondary">May UI preserves native HTML semantics, visible keyboard focus, touch-safe hover behavior, and reduced-motion preferences.</Text></section>
      <section className="site-detail-section"><h2>Props</h2><div className="site-props-table"><table><thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>{entry.props.map((prop) => <tr key={prop.name}><td><code>{prop.name}{prop.required ? ' *' : ''}</code></td><td><code>{prop.type}</code></td><td>{prop.defaultValue ?? '—'}</td><td>{prop.description || '—'}</td></tr>)}</tbody></table></div></section>
      {related.length > 0 && <section className="site-detail-section"><h2>Related</h2><div className="site-related">{related.map((item) => <SiteLink key={item.slug} href={`/components/${item.slug}`}>{item.name}</SiteLink>)}</div></section>}
    </main>
  )
}
