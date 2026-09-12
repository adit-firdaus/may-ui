/**
 * Provider-first distribution contract. This deliberately exercises the built
 * package, because source-only assertions cannot catch lost style resources.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement as h, Fragment, version as reactVersion } from 'react'
import { renderToPipeableStream, renderToStaticMarkup } from 'react-dom/server'
import { Writable } from 'node:stream'
import * as May from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'

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

check('configuration hooks expose the effective resolved values', () => {
  function Probe() {
    const config = May.useMayConfig()
    const theme = May.useMayTheme()
    const tokens = May.useMayTokens()
    return h('output', {
      'data-mode': theme.mode,
      'data-resolved': theme.resolvedMode,
      'data-primary': tokens.colorPrimary,
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

await checkAsync('the provider nonce reaches streamed React style resources', async () => {
  const html = await renderStream(
    h(May.MayProvider, { styleNonce: 'nonce-123' }, h(May.Button, {}, 'Nonce')),
    { nonce: { style: 'nonce-123' } },
  )
  assert.match(html, /<style[^>]+nonce="nonce-123"/)
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

if (failures.length) {
  console.log(`\n${failures.length} provider-first contract check(s) failed`)
  process.exit(1)
}
