/**
 * Provider-first distribution contract. This deliberately exercises the built
 * package, because source-only assertions cannot catch lost style resources.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement as h, Fragment, version as reactVersion } from 'react'
import { renderToPipeableStream, renderToStaticMarkup } from 'react-dom/server'
import { Writable } from 'node:stream'
import * as May from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'
import * as Examples from '../dist/examples.js'

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

async function checkAsync(name, run) {
  try {
    await run()
    console.log(`ok   ${name}`)
  } catch (error) {
    failures.push(name)
    console.log(`FAIL ${name}`)
    console.log(`     ${String(error.message ?? error).split('\n')[0]}`)
  }
}

const renderStream = (node, options) =>
  new Promise((resolveMarkup, reject) => {
    let markup = ''
    const destination = new Writable({
      write(chunk, _encoding, done) {
        markup += chunk
        done()
      },
    })
    destination.on('finish', () => resolveMarkup(markup))
    destination.on('error', reject)
    const stream = renderToPipeableStream(node, {
      ...options,
      onAllReady() {
        stream.pipe(destination)
      },
      onError: reject,
    })
  })

const count = (source, pattern) => [...source.matchAll(pattern)].length

check('React 19 is the runtime baseline', () => {
  assert.equal(reactVersion.split('.')[0], '19')
})

check('the provider-first hooks are public', () => {
  assert.equal(typeof May.useMayConfig, 'function')
  assert.equal(typeof May.useMayTheme, 'function')
  assert.equal(typeof May.useMayTokens, 'function')
  assert.equal(May.MayHost, undefined)
})

check('SegmentedControl uses a real-sized Motion layout thumb', () => {
  const source = readFileSync(resolve(root, 'src/components/SegmentedControl/SegmentedControl.tsx'), 'utf8')
  const css = readFileSync(resolve(root, 'src/components/SegmentedControl/SegmentedControl.css'), 'utf8')
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const vite = readFileSync(resolve(root, 'vite.config.ts'), 'utf8')
  assert.match(source, /LayoutGroup, MotionConfig, backOut, motion, useDragControls/)
  assert.match(source, /from 'motion\/react'/)
  assert.doesNotMatch(source, /from ['"]\.\.\/\.\.\/motion\/useSlidingThumb['"]/)
  assert.match(source, /layoutId={`may-segmented-thumb-\${id}`}/)
  assert.match(source, /drag="x"/)
  assert.match(source, /dragConstraints={trackRef}/)
  assert.match(source, /dragMomentum={false}/)
  assert.match(source, /boundsRef/)
  assert.match(source, /import {[^}]*backOut[^}]*} from 'motion\/react'/)
  assert.match(source, /const PRESS_SCALE = 1\.16/)
  assert.match(source, /type: 'tween', duration: 0\.22, ease: backOut/)
  assert.match(source, /whileTap="pressed"/)
  assert.match(source, /pressed: { scale: PRESS_SCALE }/)
  assert.match(source, /whileDrag={{ scale: PRESS_SCALE }}/)
  assert.doesNotMatch(source, /useMotionValue|dragX/)
  assert.match(source, /dragControls\.start\(event, { snapToCursor: true }\)/)
  assert.match(source, /dragConstraints={trackRef}/)
  assert.doesNotMatch(source, /index !== selectedIndex/)
  assert.match(source, /className="may-segmented__thumb-layout"[\s\S]*?<motion\.span\s+className="may-segmented__thumb"/)
  assert.match(source, /may-segmented__thumb-label[\s\S]*?options\[previewIndex \?\? selectedIndex\]/)
  assert.match(css, /may-segmented__thumb-layout\s*{[^}]*z-index: 2[^}]*pointer-events: none/s)
  assert.match(css, /aria-selected='true'[^}]*may-segmented__label[^}]*opacity: 0/s)
  assert.match(css, /data-dragging='true'[^}]*aria-selected='true'[^}]*may-segmented__label[^}]*opacity: 1/s)
  assert.match(css, /may-segmented__label\s*{[^}]*transition: opacity var\(--may-duration-fast\) var\(--may-ease-out\)/s)
  assert.equal(pkg.dependencies.motion, '^13.2.0')
  assert.match(vite, /\^motion\(\?:\\\/\|\$\)/)
})

check('configuration hooks expose the effective resolved values', () => {
  function Probe() {
    const config = May.useMayConfig()
    const theme = May.useMayTheme()
    const tokens = May.useMayTokens()
    return h('output', {
      'data-mode': theme.mode,
      'data-resolved': theme.resolvedMode,
      'data-primary': tokens.colorPrimary,
      'data-fast-duration': tokens.durationFast,
      'data-size': config.components.Button?.size,
      'data-frozen': String(Object.isFrozen(config.components.Button)),
    })
  }
  const html = renderToStaticMarkup(
    h(
      May.MayProvider,
      {
        theme: { mode: 'dark', dark: { colorPrimary: '#48f' } },
        components: { Button: { size: 'lg' } },
      },
      h(Probe),
    ),
  )
  assert.match(html, /data-mode="dark"/)
  assert.match(html, /data-resolved="dark"/)
  assert.match(html, /data-primary="#48f"/)
  assert.match(html, /data-fast-duration="150ms"/)
  assert.match(html, /data-size="lg"/)
  assert.match(html, /data-frozen="true"/)
})

check('generated token defaults keep light and dark palettes distinct', () => {
  const generated = readFileSync(resolve(root, 'src/styles/tokens.generated.ts'), 'utf8')
  const light = generated.match(/export const mayLightTokens = \{([\s\S]*?)\n\}/)?.[1] ?? ''
  const dark = generated.match(/export const mayDarkTokens = \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(light, /blue: "#007aff"/)
  assert.match(dark, /blue: "#0a84ff"/)
})

check('a component owns deduplicated React style resources without a provider', () => {
  const html = renderToStaticMarkup(
    h(Fragment, {}, h(May.Button, {}, 'One'), h(May.Button, {}, 'Two')),
  )
  assert.match(html, /data-precedence="may-ui-foundation"/)
  assert.match(html, /data-precedence="may-ui-components"/)
  assert.equal(count(html, /data-href="may-ui:Button:[^"]+"/g), 1)
})

check('every visual component export owns a built style resource', () => {
  const missing = [May, Desktop, Mobile]
    .flatMap((module) => Object.entries(module))
    .filter(([name, value]) => /^[A-Z]/.test(name) && name !== 'PlatformProvider' &&
      (typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value)))
    .filter(([, value]) => !value.__mayStyles)
    .map(([name]) => name)
  assert.deepEqual(missing, [])
})

check('provider defaults apply and explicit local props win', () => {
  const configured = renderToStaticMarkup(
    h(
      May.MayProvider,
      { components: { Button: { size: 'lg', variant: 'tinted' } } },
      h(May.Button, {}, 'Configured'),
    ),
  )
  assert.match(configured, /data-size="lg"/)
  assert.match(configured, /data-variant="tinted"/)

  const local = renderToStaticMarkup(
    h(
      May.MayProvider,
      { components: { Button: { size: 'lg' } } },
      h(May.Button, { size: 'sm' }, 'Local'),
    ),
  )
  assert.match(local, /data-size="sm"/)
})

check('nested provider defaults merge by component prop', () => {
  const html = renderToStaticMarkup(
    h(
      May.MayProvider,
      { components: { Button: { size: 'lg', variant: 'tinted' } } },
      h(
        May.MayProvider,
        { components: { Button: { size: 'sm' } } },
        h(May.Button, {}, 'Nested'),
      ),
    ),
  )
  assert.match(html, /data-size="sm"/)
  assert.match(html, /data-variant="tinted"/)
})

check('theme modes and token override tiers are rendered on the provider', () => {
  const html = renderToStaticMarkup(
    h(
      May.MayProvider,
      {
        theme: {
          mode: 'dark',
          tokens: { radiusCard: '18px' },
          light: { colorPrimary: '#06f' },
          dark: { colorPrimary: '#48f' },
        },
      },
      h(May.Button, {}, 'Theme'),
    ),
  )
  assert.match(html, /data-may-theme="dark"/)
  assert.match(html, /--may-user-radius-card:18px/)
  assert.match(html, /--may-user-light-color-primary:#06f/)
  assert.match(html, /--may-user-dark-color-primary:#48f/)
})

check('system token overrides include a pre-hydration dark media rule', () => {
  const html = renderToStaticMarkup(
    h(
      May.MayProvider,
      { theme: { mode: 'system', light: { colorPrimary: '#06f' }, dark: { colorPrimary: '#48f' } } },
      h('span', {}, 'System'),
    ),
  )
  const rootTag = html.match(/<div[^>]*data-slot="root"[^>]*>/)?.[0] ?? ''
  assert.doesNotMatch(rootTag, /data-may-theme=/)
  assert.match(html, /@media\(prefers-color-scheme:dark\)/)
  assert.match(html, /var\(--may-user-dark-color-primary\)/)
})

check('only the outer provider mounts the imperative host', () => {
  const nested = renderToStaticMarkup(
    h(May.MayProvider, {}, h(May.MayProvider, {}, h('span', {}, 'Nested'))),
  )
  assert.equal(count(nested, /data-slot="may-host"/g), 1)

  const disabled = renderToStaticMarkup(
    h(May.MayProvider, { host: false }, h('span', {}, 'No host')),
  )
  assert.equal(count(disabled, /data-slot="may-host"/g), 0)
})

/*
 * EVERY style resource carries the nonce, not just one.
 *
 * A component sheet without it is blocked by a strict `style-src 'nonce-…'`
 * and that component renders unstyled, so one nonced tag out of several is
 * not a pass. It used to assert a single match.
 *
 * Note the option shape. React's `nonce` render option takes a string OR
 * `{ script, style }`, and the STRING form applies to scripts alone —
 * measured: with `nonce: 'nonce-123'` not one style tag is nonced, while
 * React's warning says only to "provide the same style nonce value as a
 * render option". The obvious reading of that warning is the one that does
 * not work, which is why getting-started.md spells the object form out.
 */
await checkAsync('the provider nonce reaches every streamed style resource', async () => {
  const html = await renderStream(
    h(
      May.MayProvider,
      { styleNonce: 'nonce-123', theme: { tokens: { blue: '#123456' } } },
      h(May.Button, {}, 'Nonce'),
      h(May.Combobox, { options: [{ label: 'A', value: 'a' }] }),
    ),
    { nonce: { style: 'nonce-123' } },
  )
  const styles = html.match(/<style[^>]*>/g) ?? []
  assert.ok(styles.length >= 2, `expected several style tags, saw ${styles.length}`)
  const bare = styles.filter((tag) => !tag.includes('nonce="nonce-123"'))
  assert.deepEqual(bare, [], `style tags without the nonce: ${bare.join(' ')}`)
})

await checkAsync('imperative toast warns when no provider host is mounted', async () => {
  const warnings = []
  const warn = console.warn
  console.warn = (message) => warnings.push(String(message))
  try {
    const id = May.toast('Unhosted')
    await Promise.resolve()
    assert.equal(warnings.some((message) => message.includes('requires an outer MayProvider')), true)
    May.dismiss(id)
  } finally {
    console.warn = warn
  }
})

check('the package emits and exports no stylesheet', () => {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  assert.equal(pkg.exports['./styles.css'], undefined)
  assert.equal(readdirSync(resolve(root, 'dist')).some((file) => file.endsWith('.css')), false)
  assert.equal(existsSync(resolve(root, 'dist/mayui.css')), false)
})

/*
 * A stateful prop comes with an uncontrolled counterpart.
 *
 * Five overlays plus mobile Popup used to demand `open` (or `visible`) and a
 * close handler, so showing a dialog cost the consumer a useState and two
 * callbacks before they could write any content — while Popover, Menu,
 * Collapsible and Sidebar managed themselves. One library, two contracts.
 *
 * Read off the published types rather than the source, because the published
 * types are what a consumer actually programs against.
 */
/*
 * The two formats export the same names.
 *
 * The package ships ESM and CJS from one source, and the build preserves
 * modules — so each entry is a re-export shim over a tree of files, twice
 * over. A name that reached one format and not the other would leave a CJS
 * consumer with `undefined` where a component should be, at runtime, with no
 * type error and no build warning anywhere in this repo.
 */
/*
 * useMayTokens() resolves the same tiers the stylesheet does.
 *
 * The check on the rendered provider proves the CSS carries each tier. The
 * hook is the other half of the same contract, and it is what a consumer
 * reads to paint their own canvas or chart to match the components — so a
 * disagreement between the two shows up as a shade that is almost right.
 * Worth asserting separately after `useMayTokens()` turned out to be handing
 * back the legacy cubic-bezier for every spring.
 */
check('useMayTokens resolves default < tokens < mode', () => {
  const read = (props) => {
    let seen
    const Probe = () => {
      seen = May.useMayTokens().blue
      return null
    }
    renderToStaticMarkup(h(May.MayProvider, props, h(Probe)))
    return seen
  }

  assert.equal(read({}), '#007aff', 'the light default')
  assert.equal(read({ theme: { tokens: { blue: '#common' } } }), '#common', 'common beats default')
  assert.equal(
    read({ theme: { tokens: { blue: '#common' }, light: { blue: '#light' } } }),
    '#light',
    'the mode tier beats common',
  )
  assert.equal(
    read({ theme: { mode: 'dark', tokens: { blue: '#common' }, dark: { blue: '#dark' } } }),
    '#dark',
    'dark takes the dark tier',
  )
  assert.equal(
    read({ theme: { mode: 'dark', tokens: { blue: '#common' }, light: { blue: '#light' } } }),
    '#common',
    'dark ignores the light tier',
  )
  // An optional value threaded through must not wipe the default: the provider
  // filters undefined at the boundary, which is what keeps the plain spread in
  // resolveTokens safe.
  assert.equal(read({ theme: { tokens: { blue: undefined } } }), '#007aff', 'undefined is not a value')
})

/*
 * Every entry declares itself a client module.
 *
 * Without the directive a Next.js App Router page — a server component by
 * default — cannot build against this package at all. Proved against Next.js
 * 15.1: importing Button into a server component fails "Failed to collect
 * page data" with `TypeError: (0, n.createContext) is not a function`,
 * because src/config/context.tsx calls createContext at module scope and
 * React's server build does not export it. `node --conditions=react-server`
 * reproduces it without Next at all.
 *
 * It is one line of Rollup config and nothing in the library references it,
 * so it is exactly the sort of thing a later change to output options drops
 * silently — and the symptom lands in the consumer's build, not ours.
 */
check('every entry is marked a client module', () => {
  for (const file of ['mayui.js', 'desktop.js', 'mobile.js', 'examples.js',
                      'mayui.cjs', 'desktop.cjs', 'mobile.cjs', 'examples.cjs']) {
    const head = readFileSync(resolve(root, 'dist', file), 'utf8').slice(0, 64)
    assert.match(head, /^['"]use client['"];/, `${file} does not open with the directive`)
  }
  // Not on the leaves: the directive marks a boundary, and repeating it on
  // every one of ~200 preserved modules is bytes for nothing.
  const leaf = readFileSync(resolve(root, 'dist/src/components/Button/Button.js'), 'utf8')
  assert.equal(/^['"]use client['"]/.test(leaf), false, 'leaf modules should not carry it')
})

check('ESM and CJS export the same names from every entry', () => {
  const require = createRequire(import.meta.url)
  const entries = [
    ['.', May, '../dist/mayui.cjs'],
    ['./desktop', Desktop, '../dist/desktop.cjs'],
    ['./mobile', Mobile, '../dist/mobile.cjs'],
    ['./examples', Examples, '../dist/examples.cjs'],
  ]

  for (const [name, namespace, cjsPath] of entries) {
    const cjs = new Set(Object.keys(require(cjsPath)))
    const esm = new Set(Object.keys(namespace))
    const missingFromCjs = [...esm].filter((key) => !cjs.has(key))
    const missingFromEsm = [...cjs].filter((key) => !esm.has(key) && key !== 'default')
    assert.deepEqual(missingFromCjs, [], `${name}: in ESM but not CJS`)
    assert.deepEqual(missingFromEsm, [], `${name}: in CJS but not ESM`)
  }
})

check('every controllable prop has a default counterpart', () => {
  /*
   * Genuinely controlled-only, with reasons:
   *   Steps, Pagination — the consumer always has to know the step or page to
   *     render the content beside it, so an uncontrolled one could never be
   *     read back and would be API nobody could use.
   *   SplitPane.size — the deprecated pixel alias; `paneSize` carries the
   *     default and the new name.
   */
  const EXEMPT = new Set(['StepsProps.current', 'PaginationProps.current', 'SplitPaneProps.size'])
  const PAIRS = { open: 'defaultOpen', visible: 'defaultVisible', collapsed: 'defaultCollapsed' }

  const sources = ['dist/index.d.ts', 'dist/desktop.d.ts', 'dist/mobile.d.ts'].map((file) =>
    readFileSync(resolve(root, file), 'utf8'),
  )

  const offenders = []
  for (const dts of sources) {
    // Each exported props interface, with its body up to the closing brace.
    for (const match of dts.matchAll(/export declare interface (\w+Props)[^{]*\{([\s\S]*?)\n\}/g)) {
      const [, name, body] = match
      for (const [prop, fallback] of Object.entries(PAIRS)) {
        const declared = new RegExp(`^\\s{4}${prop}\\?:`, 'm').test(body)
        const hasDefault = new RegExp(`^\\s{4}${fallback}\\?:`, 'm').test(body)
        if (declared && !hasDefault && !EXEMPT.has(`${name}.${prop}`)) {
          offenders.push(`${name}.${prop} (no ${fallback})`)
        }
      }
    }
  }

  assert.deepEqual(
    [...new Set(offenders)],
    [],
    `controlled-only: ${[...new Set(offenders)].join(', ')} — add the default, or exempt it in check-provider.mjs with a reason`,
  )
})

if (failures.length) {
  console.log(`\n${failures.length} provider-first contract check(s) failed`)
  process.exit(1)
}
