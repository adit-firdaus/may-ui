import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Button, EmptyState, MayProvider, Sheet, Spinner, Text, useIsDesktop } from '@adit_firdaus/may-ui'
import { IoColorWandOutline, IoLogoGithub, IoSearchOutline } from 'react-icons/io5'
import catalogData from './generated/catalog-search.json'
import { navigate, SiteLink, useRoute } from './router'
import { SiteConfigProvider, useSiteConfig } from './site-config'

declare const __MAY_VERSION__: string

const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const ComponentsPage = lazy(() => import('./pages/ComponentsPage'))
const PatternsPage = lazy(() => import('./pages/PatternsPage'))
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'))
const Configurator = lazy(() => import('./Configurator').then((module) => ({ default: module.Configurator })))
const CommandPalette = lazy(() => import('@adit_firdaus/may-ui/desktop').then((module) => ({ default: module.CommandPalette })))
const catalog = catalogData

const patternNames = [
  ['settings', 'Settings'], ['mail-inbox', 'Mail Inbox'], ['mail-detail', 'Mail Detail'],
  ['now-playing', 'Now Playing'], ['photos', 'Photos'], ['profile', 'Profile'],
  ['notifications', 'Notifications'], ['checkout', 'Checkout'], ['onboarding', 'Onboarding'],
  ['health', 'Health'], ['wallet', 'Wallet'], ['search', 'Search'], ['app-shell', 'App Shell'],
  ['analytics', 'Analytics Dashboard'], ['admin', 'Members Admin'], ['files', 'File Browser'],
  ['command-palette', 'Command Palette'], ['preferences', 'Preferences'],
  ['split-inbox', 'Split Inbox'], ['team', 'Team'], ['auth', 'Sign In'],
  ['forms', 'Form Showcase'], ['states', 'Empty and Loading'], ['overlays', 'Overlays'],
] as const

const nav = [
  ['/', 'Overview'], ['/docs/getting-started', 'Docs'], ['/components', 'Components'],
  ['/patterns', 'Patterns'], ['/playground', 'Playground'],
] as const

const titleFor = (path: string) => {
  if (path.startsWith('/components/')) {
    const parts = path.split('/')
    return `${catalog.find((entry) => entry.slug === parts[parts.length - 1])?.name ?? 'Component'} · May UI`
  }
  if (path.startsWith('/components')) return 'Components · May UI'
  if (path.startsWith('/patterns')) return 'Patterns · May UI'
  if (path.startsWith('/playground')) return 'Playground · May UI'
  if (path.startsWith('/docs')) return 'Documentation · May UI'
  return 'May UI · Apple-native React design system'
}

const descriptionFor = (path: string) => {
  if (path.startsWith('/components')) return 'Explore every May UI component with live provider defaults, local props, API metadata, and copy-ready React.'
  if (path.startsWith('/patterns')) return 'Inspect complete May UI application patterns across phone, tablet, and desktop presentations.'
  if (path.startsWith('/playground')) return 'Configure MayProvider tokens and component defaults in a live, shareable React playground.'
  if (path.startsWith('/docs')) return 'Learn how to install, configure, theme, and compose May UI.'
  return 'May UI — Apple-native React components, real spring motion, and provider-first configuration.'
}

function CurrentPage({ openConfig }: { openConfig: () => void }) {
  const { path } = useRoute()
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'docs') return <DocsPage slug={parts[1] ?? 'getting-started'} />
  if (parts[0] === 'components') return <ComponentsPage slug={parts[1]} />
  if (parts[0] === 'patterns') return <PatternsPage slug={parts[1]} />
  if (parts[0] === 'playground') return <PlaygroundPage />
  if (path !== '/') return <main className="site-not-found"><EmptyState title="Page not found" description="That May UI route does not exist." action={<Button asChild><SiteLink href="/">Return home</SiteLink></Button>} /></main>
  return <OverviewPage openConfig={openConfig} />
}

function SiteApp() {
  const route = useRoute()
  const isDesktop = useIsDesktop()
  const [configOpen, setConfigOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    document.title = titleFor(route.path)
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', descriptionFor(route.path))
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1, article h1')?.focus())
  }, [route.path])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])

  const groups = useMemo(() => [
    { id: 'navigate', heading: 'Navigate', items: nav.map(([href, label]) => ({ id: href, label, hint: href, onSelect: () => navigate(href) })) },
    { id: 'components', heading: 'Components', items: catalog.map((entry) => ({ id: `component-${entry.slug}`, label: entry.name, hint: `${entry.family} · ${entry.category}`, keywords: [entry.family, entry.category], onSelect: () => navigate(`/components/${entry.slug}`) })) },
    { id: 'patterns', heading: 'Patterns', items: patternNames.map(([id, label]) => ({ id: `pattern-${id}`, label, hint: 'Pattern', onSelect: () => navigate(`/patterns/${id}`) })) },
  ], [])

  return (
    <div className="site-shell">
      <a className="site-skip" href="#site-main">Skip to content</a>
      <header className="site-header">
        <SiteLink className="site-brand" href="/"><span className="site-brand__mark">M</span><span>May UI</span></SiteLink>
        <nav className="site-nav" aria-label="Primary">
          {nav.map(([href, label]) => <SiteLink key={href} className={route.path === href || (href !== '/' && route.path.startsWith(href)) ? 'active' : ''} href={href}>{label}</SiteLink>)}
        </nav>
        <div className="site-header__actions">
          <Button className="site-search-button" size="sm" variant="gray" onClick={() => setSearchOpen(true)} leadingIcon={<IoSearchOutline />} aria-label="Search May UI"><span>Search</span><kbd>⌘K</kbd></Button>
          <Button size="sm" variant="tinted" onClick={() => setConfigOpen(true)} leadingIcon={<IoColorWandOutline />}>Config</Button>
          <Button className="site-github" size="sm" variant="plain" asChild><a href="https://github.com/adit-firdaus/may-ui" aria-label="May UI on GitHub"><IoLogoGithub /></a></Button>
          <Button className="site-menu-button" size="sm" variant="gray" onClick={() => setMobileNav(true)}>Menu</Button>
        </div>
      </header>

      <div id="site-main" className="site-route">
        <Suspense fallback={<div className="site-loading"><Spinner label="Loading page" /></div>}>
          <CurrentPage openConfig={() => setConfigOpen(true)} />
        </Suspense>
      </div>

      <footer className="site-footer"><Text variant="footnote" tone="secondary">May UI v{__MAY_VERSION__} · Apple-native React components</Text><div><SiteLink href="/docs/getting-started">Docs</SiteLink><a href={`${import.meta.env.BASE_URL}storybook/`}>Storybook</a><a href="https://github.com/adit-firdaus/may-ui">GitHub</a></div></footer>

      {isDesktop ? (
        <aside className={`site-config-drawer${configOpen ? ' open' : ''}`} aria-hidden={!configOpen} inert={!configOpen}>
          <Button className="site-config-close" size="sm" variant="gray" onClick={() => setConfigOpen(false)}>Close</Button>
          <Suspense fallback={<Spinner label="Loading configuration" />}><Configurator /></Suspense>
        </aside>
      ) : (
        <Sheet open={configOpen} onClose={() => setConfigOpen(false)} title="Configure May UI" size="full"><Suspense fallback={<Spinner label="Loading configuration" />}><Configurator onDone={() => setConfigOpen(false)} /></Suspense></Sheet>
      )}

      <Sheet open={!isDesktop && mobileNav} onClose={() => setMobileNav(false)} title="Navigate" size="lg">
        <div className="site-mobile-nav">{nav.map(([href, label]) => <SiteLink key={href} href={href} onClick={() => setMobileNav(false)}>{label}</SiteLink>)}</div>
      </Sheet>
      {searchOpen && <Suspense fallback={null}><CommandPalette open onOpenChange={setSearchOpen} groups={groups} hotkey={false} placeholder="Search May UI" /></Suspense>}
    </div>
  )
}

function ConfiguredSite() {
  const { config, dirty, reset } = useSiteConfig()
  return (
    <>
      {dirty && <button className="site-recovery" onClick={reset}>Reset May UI configuration</button>}
      <MayProvider {...config} linkComponent={SiteLink}><SiteApp /></MayProvider>
    </>
  )
}

export function App() {
  return <SiteConfigProvider><ConfiguredSite /></SiteConfigProvider>
}
