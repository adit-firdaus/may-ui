import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  Button,
  EmptyState,
  Input,
  SegmentedControl,
  Select,
  Sheet,
  Tag,
  Text,
  useIsDesktop,
} from '@adit_firdaus/may-ui'
import { Sidebar, SidebarItem, SidebarSection } from '@adit_firdaus/may-ui/desktop'
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
type Family = (typeof families)[number]

const readLocalProps = (encoded: string | null) => {
  if (!encoded) return {}
  try {
    const value = decodeState(encoded)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}

function CatalogNavigation({
  query,
  family,
  category,
  capability,
  categories,
  filtered,
  activeSlug,
  onQueryChange,
  onFamilyChange,
  onCategoryChange,
  onCapabilityChange,
  onNavigate,
}: {
  query: string
  family: Family
  category: string
  capability: string
  categories: string[]
  filtered: CatalogEntry[]
  onQueryChange: (value: string) => void
  onFamilyChange: (value: Family) => void
  onCategoryChange: (value: string) => void
  onCapabilityChange: (value: string) => void
  activeSlug: string
  onNavigate?: (slug: string) => void
}) {
  return (
    <div
      className="site-catalog-navigation"
      onClick={(event) => {
        const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#component-"]')
        if (anchor) onNavigate?.(anchor.hash.replace('#component-', ''))
      }}
    >
      <Input value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} placeholder="Search components…" aria-label="Search components" />
      <Select
        value={family}
        onChange={(event) => onFamilyChange(event.currentTarget.value as Family)}
        options={families.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))}
        aria-label="Component family"
      />
      <Select value={category} onChange={(event) => onCategoryChange(event.currentTarget.value)} options={[{ label: 'All categories', value: 'all' }, ...categories.map((value) => ({ label: value, value }))]} aria-label="Category" />
      <Select value={capability} onChange={(event) => onCapabilityChange(event.currentTarget.value)} options={[
        { label: 'All capabilities', value: 'all' },
        { label: 'Provider configurable', value: 'configurable' },
        { label: 'Interactive controls', value: 'interactive' },
        { label: 'Stateful', value: 'stateful' },
        { label: 'Data driven', value: 'data' },
      ]} aria-label="Capability" />
      <SidebarItem
        active={family === 'all' && category === 'all'}
        badge={catalog.length}
        onClick={() => { onFamilyChange('all'); onCategoryChange('all') }}
      >
        All components
      </SidebarItem>
      {families.slice(1).map((familyName) => {
        const familyItems = filtered.filter((item) => item.family === familyName)
        if (!familyItems.length) return null
        const familyCategories = [...new Set(catalog.filter((item) => item.family === familyName).map((item) => item.category))].sort()
        return (
          <SidebarSection key={familyName} title={`${familyName} · ${familyItems.length}`} collapsible>
            {familyCategories.map((categoryName) => (
              <SidebarItem
                key={`${familyName}-${categoryName}`}
                active={family === familyName && category === categoryName}
                badge={catalog.filter((item) => item.family === familyName && item.category === categoryName).length}
                onClick={() => { onFamilyChange(familyName); onCategoryChange(categoryName) }}
              >
                {categoryName}
              </SidebarItem>
            ))}
            <div className="site-catalog-navigation__components">
              {familyItems.map((item) => <SidebarItem key={item.slug} href={`#component-${item.slug}`} active={activeSlug === item.slug}>{item.name}</SidebarItem>)}
            </div>
          </SidebarSection>
        )
      })}
    </div>
  )
}

export default function ComponentsPage({ slug }: { slug?: string }) {
  const route = useRoute()
  const { config } = useSiteConfig()
  const isDesktop = useIsDesktop()
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<Family>('all')
  const [category, setCategory] = useState('all')
  const [capability, setCapability] = useState('all')
  const [width, setWidth] = useState('wide')
  const [mobileCatalogNav, setMobileCatalogNav] = useState(false)
  const [activeSlug, setActiveSlug] = useState('')
  const [visiblePreviews, setVisiblePreviews] = useState<Set<string>>(() => new Set())
  const [localProps, setLocalProps] = useState<Record<string, unknown>>(() => readLocalProps(route.search.get('props')))
  const entry = catalog.find((item) => item.slug === slug)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => setLocalProps(readLocalProps(new URLSearchParams(window.location.search).get('props'))), [slug])
  useEffect(() => {
    const reset = () => setLocalProps({})
    window.addEventListener('may-site:reset', reset)
    return () => window.removeEventListener('may-site:reset', reset)
  }, [])
  useEffect(() => {
    const readHash = () => setActiveSlug(window.location.hash.replace(/^#component-/, ''))
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])
  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    if (Object.keys(localProps).length) search.set('props', encodeState(localProps))
    else search.delete('props')
    replaceSearch(search)
  }, [localProps])

  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category))].sort(), [])
  const filtered = useMemo(() => catalog.filter((item) =>
    (family === 'all' || item.family === family) &&
    (category === 'all' || item.category === category) &&
    (capability === 'all' ||
      capability === 'configurable' && item.controls.some((control) => control.providerDefault) ||
      capability === 'interactive' && item.controls.length > 0 ||
      capability === 'stateful' && item.controls.some((control) => control.kind === 'boolean') ||
      capability === 'data' && item.props.some((prop) => ['items', 'options', 'data', 'columns'].includes(prop.name))) &&
    `${item.name} ${item.description}`.toLowerCase().includes(deferredQuery.toLowerCase()),
  ), [family, category, capability, deferredQuery])
  const grouped = useMemo(() => families.slice(1).map((familyName) => ({
    family: familyName,
    categories: categories.map((categoryName) => ({
      category: categoryName,
      items: filtered.filter((item) => item.family === familyName && item.category === categoryName),
    })).filter((group) => group.items.length),
  })).filter((group) => group.categories.length), [categories, filtered])

  useEffect(() => {
    if (entry) return
    const cards = [...document.querySelectorAll<HTMLElement>('[data-catalog-slug]')]
    const currentSlugs = new Set(filtered.map((item) => item.slug))
    setVisiblePreviews((current) => {
      const next = new Set([...current].filter((itemSlug) => currentSlugs.has(itemSlug)))
      return next.size === current.size ? current : next
    })
    if (typeof IntersectionObserver === 'undefined') {
      setVisiblePreviews(currentSlugs)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      setVisiblePreviews((current) => {
        const next = new Set(current)
        let changed = false
        for (const observed of entries) {
          const card = observed.target as HTMLElement
          const itemSlug = card.dataset.catalogSlug
          if (!itemSlug) continue
          if (observed.isIntersecting) {
            if (!next.has(itemSlug)) { next.add(itemSlug); changed = true }
          } else if (next.has(itemSlug) && !card.contains(document.activeElement)) {
            next.delete(itemSlug)
            changed = true
          }
        }
        return changed ? next : current
      })
    }, { rootMargin: '1000px 0px' })
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [entry, filtered])

  if (!entry && slug) return <EmptyState title="Component not found" action={<Button asChild><SiteLink href="/components">Back to catalog</SiteLink></Button>} />

  if (!entry) {
    const resetFilters = () => { setQuery(''); setFamily('all'); setCategory('all'); setCapability('all') }
    const navigationProps = {
      query, family, category, capability, categories, filtered, activeSlug,
      onQueryChange: setQuery,
      onFamilyChange: setFamily,
      onCategoryChange: setCategory,
      onCapabilityChange: setCapability,
    }
    return (
      <main className="site-catalog-shell">
        {isDesktop && (
          <Sidebar
            className="site-catalog-sidebar"
            aria-label="Component catalog"
            header={<div><Text weight="semibold">Catalog</Text><Text variant="caption-1" tone="secondary">{filtered.length} of {catalog.length}</Text></div>}
          >
            <CatalogNavigation {...navigationProps} onNavigate={setActiveSlug} />
          </Sidebar>
        )}
        <div className="site-catalog-index">
          <header className="site-page-heading">
            <Text variant="caption-1" tone="tint" weight="semibold">COMPONENT CATALOG</Text>
            <h1 tabIndex={-1}>Every building block.</h1>
            <Text tone="secondary">{filtered.length} of {catalog.length} components · adaptive, desktop, and mobile previews in one place.</Text>
          </header>
          <div className="site-catalog-mobile-toolbar">
            <Button variant="gray" onClick={() => setMobileCatalogNav(true)}>Browse catalog</Button>
            <Text variant="footnote" tone="secondary">{filtered.length} shown</Text>
          </div>
          {grouped.length ? grouped.map((familyGroup) => (
            <section className="site-catalog-family" key={familyGroup.family}>
              <h2>{familyGroup.family}</h2>
              {familyGroup.categories.map((categoryGroup) => (
                <section className="site-catalog-category" key={categoryGroup.category}>
                  <div className="site-catalog-category__heading"><h3>{categoryGroup.category}</h3><span>{categoryGroup.items.length}</span></div>
                  <div className="site-catalog-grid">
                    {categoryGroup.items.map((item) => (
                      <article className="site-catalog-card" data-catalog-slug={item.slug} id={`component-${item.slug}`} key={item.slug}>
                        <div className="site-catalog-card__meta"><Tag size="sm">{item.family}</Tag><span>{item.category}</span></div>
                        <div className={`site-catalog-card__preview site-preview-family-${item.family}`}>
                          {visiblePreviews.has(item.slug)
                            ? <PreviewRenderer entry={item} />
                            : <span className="site-catalog-card__placeholder" aria-hidden="true">{item.name} preview</span>}
                        </div>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <SiteLink className="site-catalog-card__arrow" href={`/components/${item.slug}`}>Open workbench →</SiteLink>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </section>
          )) : <EmptyState title="No components found" description="Try another search or clear the catalog filters." action={<Button onClick={resetFilters}>Clear filters</Button>} />}
        </div>
        <Sheet open={!isDesktop && mobileCatalogNav} onClose={() => setMobileCatalogNav(false)} title="Component catalog" side="start" size="lg">
          <CatalogNavigation {...navigationProps} onNavigate={(nextSlug) => { setActiveSlug(nextSlug); setMobileCatalogNav(false) }} />
        </Sheet>
      </main>
    )
  }

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
