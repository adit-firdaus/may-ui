import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import * as Adaptive from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'
import catalog from '../examples/src/generated/catalog.json' with { type: 'json' }
import {
  decodeState,
  encodeState,
  generateReactCode,
  legacyPath,
  resolveInitialState,
  validateSiteConfig,
} from '../examples/src/lib/config-codec.mjs'

const root = resolve(import.meta.dirname, '..')
const failures = []

function check(name, run) {
  try {
    run()
    console.log(`ok   ${name}`)
  } catch (error) {
    failures.push(name)
    console.log(`FAIL ${name}`)
    console.log(`     ${String(error.message ?? error).split('\n')[0]}`)
  }
}

const isComponent = (value) =>
  typeof value === 'function' ||
  (typeof value === 'object' && value !== null && '$$typeof' in value)

const publicComponents = [
  ...Object.entries(Adaptive).filter(([name, value]) =>
    /^[A-Z]/.test(name) && name !== 'PlatformProvider' && isComponent(value)),
  ...Object.entries(Desktop).filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value)),
  ...Object.entries(Mobile).filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value)),
].map(([name]) => name)

check('every public visual component has one catalog entry', () => {
  const names = catalog.map((entry) => entry.name)
  assert.deepEqual([...new Set(names)].sort(), [...new Set(publicComponents)].sort())
})

check('catalog slugs and controls are valid', () => {
  assert.equal(new Set(catalog.map((entry) => entry.slug)).size, catalog.length)
  for (const entry of catalog) {
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(['adaptive', 'desktop', 'mobile'].includes(entry.family))
    const props = new Set(entry.props.map((prop) => prop.name))
    for (const control of entry.controls) assert.ok(props.has(control.prop), `${entry.name}.${control.prop}`)
  }
})

check('catalog index renders every component in a responsive app shell', () => {
  const source = readFileSync(resolve(root, 'examples/src/pages/ComponentsPage.tsx'), 'utf8')
  assert.match(source, /<Sidebar/)
  assert.match(source, /<Sheet/)
  assert.match(source, /title="Component catalog"/)
  assert.match(source, /id={`component-\${item\.slug}`}/)
  assert.match(source, /<PreviewRenderer entry={item}/)
  assert.match(source, /<article[^>]+site-catalog-card/)
  assert.doesNotMatch(source, /<SiteLink className="site-catalog-card"/)
  assert.match(source, /active={activeSlug === item\.slug}/)
  assert.match(source, /of \{catalog\.length\} components/)
})

check('catalog windows live previews and shares a quick thumb clock', () => {
  const catalogSource = readFileSync(resolve(root, 'examples/src/pages/ComponentsPage.tsx'), 'utf8')
  const siteCss = readFileSync(resolve(root, 'examples/src/site.css'), 'utf8')
  const thumbSource = readFileSync(resolve(root, 'src/motion/sliding-thumb.ts'), 'utf8')
  const segmentedSource = readFileSync(resolve(root, 'src/components/SegmentedControl/SegmentedControl.tsx'), 'utf8')

  assert.match(catalogSource, /useDeferredValue/)
  assert.equal((catalogSource.match(/new IntersectionObserver/g) ?? []).length, 1)
  assert.match(catalogSource, /rootMargin: '1000px 0px'/)
  assert.match(catalogSource, /visiblePreviews\.has\(item\.slug\)/)
  assert.match(catalogSource, /site-catalog-card__placeholder/)
  assert.match(catalogSource, /const isDesktop = useIsDesktop\(\)/)
  assert.match(catalogSource, /\{isDesktop && \(\s*<Sidebar/s)
  assert.match(siteCss, /--site-catalog-card-height:/)
  assert.match(siteCss, /height: var\(--site-catalog-card-height\)/)
  assert.match(siteCss, /contain-intrinsic-size: auto var\(--site-catalog-card-height\)/)
  assert.match(siteCss, /site-catalog-card__meta \.may-tag[^}]*animation: none/s)
  assert.match(siteCss, /site-route:has\(\.site-loading\) \+ \.site-footer[^}]*display: none/s)
  assert.match(siteCss, /@media \(max-width: 1023px\)[\s\S]*site-catalog-sidebar \{ display: none; \}/)
  assert.match(thumbSource, /export const SETTLE_MS = 220/)
  assert.doesNotMatch(segmentedSource, /const SETTLE_MS|settleMs:/)
})

check('configuration codec preserves unicode, false, and zero', () => {
  const state = {
    theme: { mode: 'dark', tokens: { fontSans: 'Mây Sans', space4: 0 } },
    components: { Button: { pill: false } },
  }
  assert.deepEqual(decodeState(encodeState(state)), state)
})

check('URL state wins over stored state and malformed state is ignored', () => {
  const defaults = { theme: { mode: 'system' } }
  const stored = { theme: { mode: 'dark' } }
  const linked = { theme: { mode: 'light' } }
  assert.deepEqual(resolveInitialState(encodeState(linked), JSON.stringify(stored), defaults), linked)
  assert.deepEqual(resolveInitialState('not-valid', JSON.stringify(stored), defaults), stored)
  assert.deepEqual(resolveInitialState('', 'not-json', defaults), defaults)
})

check('advanced config rejects unknown and wrongly typed values', () => {
  const schema = {
    tokens: new Set(['colorPrimary']),
    components: { Button: { pill: { type: 'boolean' }, size: { type: 'string' } } },
  }
  assert.equal(validateSiteConfig({ theme: { tokens: { colorPrimary: '#06f' } } }, schema).ok, true)
  assert.equal(validateSiteConfig({ theme: { tokens: { madeUp: 'x' } } }, schema).ok, false)
  assert.equal(validateSiteConfig({ components: { Button: { pill: 'yes' } } }, schema).ok, false)
})

check('legacy docs URLs canonicalize to routed docs', () => {
  assert.equal(legacyPath('/may-ui/docs/getting-started.html', '/may-ui/'), '/docs/getting-started')
  assert.equal(legacyPath('/may-ui/docs/', '/may-ui/'), '/docs/getting-started')
  assert.equal(legacyPath('/may-ui/components/button', '/may-ui/'), '/components/button')
})

check('generated React code is minimal and copy-ready', () => {
  const code = generateReactCode(
    { theme: { mode: 'dark' }, components: { Button: { size: 'lg' } } },
    { name: 'Button', importPath: '@adit_firdaus/may-ui', props: { children: 'Promote' } },
  )
  assert.match(code, /import \{ Button, MayProvider \}/)
  assert.match(code, /theme=\{\{ mode: 'dark' \}\}/)
  assert.match(code, /components=\{\{ Button: \{ size: 'lg' \} \}\}/)
  assert.match(code, /<Button>Promote<\/Button>/)
  assert.doesNotMatch(code, /platform=/)

  const provider = generateReactCode(
    { theme: { mode: 'dark' } },
    { name: 'MayProvider', importPath: '@adit_firdaus/may-ui', props: { children: 'App' } },
  )
  assert.equal((provider.match(/MayProvider/g) ?? []).length, 3)
  assert.doesNotMatch(provider, /MayProvider, MayProvider/)
})

check('site build contains the clean-route fallback', () => {
  assert.ok(existsSync(resolve(root, 'examples/dist/index.html')))
  assert.ok(existsSync(resolve(root, 'examples/dist/404.html')))
  assert.equal(
    readFileSync(resolve(root, 'examples/dist/index.html'), 'utf8'),
    readFileSync(resolve(root, 'examples/dist/404.html'), 'utf8'),
  )
})

check('site keeps the initial and dynamic route chunks within budget', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'examples/dist/.vite/manifest.json'), 'utf8'))
  const entry = manifest['index.html']
  assert.ok(entry?.isEntry)
  const entryGzip = gzipSync(readFileSync(resolve(root, 'examples/dist', entry.file))).length
  assert.ok(entryGzip <= 125 * 1024, `initial entry is ${entryGzip} bytes gzip`)
  const routes = Object.entries(manifest).filter(([key, value]) =>
    key.includes('/pages/') && value.isDynamicEntry)
  assert.equal(routes.length, 5)
  for (const [key, value] of routes) {
    const compressed = gzipSync(readFileSync(resolve(root, 'examples/dist', value.file))).length
    assert.ok(compressed <= 50 * 1024, `${key} is ${compressed} bytes gzip`)
  }
})

check('site never imports the removed library stylesheet', () => {
  const files = ['examples/src/main.tsx', 'examples/src/App.tsx']
  for (const file of files) {
    assert.doesNotMatch(readFileSync(resolve(root, file), 'utf8'), /may-ui\/styles\.css/)
  }
})

check('mobile pattern chrome stays compact and unobstructed', () => {
  const app = readFileSync(resolve(root, 'examples/src/App.tsx'), 'utf8')
  const patterns = readFileSync(resolve(root, 'examples/src/pages/PatternsPage.tsx'), 'utf8')
  const css = readFileSync(resolve(root, 'examples/src/site.css'), 'utf8')

  assert.match(app, /aria-label="Reset May UI configuration"[^>]*>Reset<\/button>/)
  assert.match(patterns, /className="site-pattern-controls"/)
  assert.doesNotMatch(css, /site-search-button span/)
  assert.match(css, /site-search-button \.may-button__label/)
  assert.match(css, /site-pattern-rail[^}]*align-items: center/s)
  assert.match(css, /site-pattern-rail a[^}]*flex: 0 0 auto[^}]*white-space: nowrap/s)
  assert.match(css, /site-pattern-controls[^}]*width: 100%/s)
  assert.match(css, /site-pattern-stage[^}]*padding-inline: 0/s)
})

if (failures.length) {
  console.log(`\n${failures.length} site contract check(s) failed`)
  process.exit(1)
}
