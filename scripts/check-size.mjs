/**
 * Published-graph weight. "Lightweight" is only real if it is enforced.
 *
 * This measures each entry's TRANSITIVE CLOSURE, not the entry file. Rollup
 * hoists code shared between entries into separate chunks, so once a fourth
 * entry was added `dist/mayui.js` shrank from 124kB to a 4.7kB re-export shim
 * over a 121kB chunk. Measuring the entry file alone would have reported a 96%
 * size *improvement* while the real cost to a consumer was unchanged — a gate
 * that passes for the wrong reason is worse than no gate.
 *
 * What it is NOT, since the build began preserving modules: a proxy for what an
 * app downloads. One file per module means per-module import/export boilerplate
 * that a consumer's bundler strips on the way in, so this total now runs ahead
 * of the real cost. `check-consumer-size.mjs` bundles a real import and weighs
 * that; this file's job is to catch the published graph growing without anyone
 * noticing.
 */
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, relative } from 'node:path'
import { builtStyleEntries, styleSheetsFor } from './built-styles.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const dist = join(root, 'dist')

/**
 * Follow static imports/re-exports from an entry and return every file reached.
 *
 * Resolves each specifier against the DIRECTORY OF THE IMPORTING FILE, not
 * against dist/. The build preserves the source tree, so a nested module
 * reaches its siblings with `../../components/...`: a walker that only matched
 * a leading `./` stopped at the first level and reported the desktop entry as
 * 807 bytes for six components. That is the failure this file's header warns
 * about — a gate that passes for the wrong reason.
 */
function closure(entry) {
  const seen = new Set()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()
    if (seen.has(file)) continue
    const path = join(dist, file)
    if (!existsSync(path)) continue
    seen.add(file)
    const src = readFileSync(path, 'utf8')
    for (const m of src.matchAll(/(?:from|import)\s*["'](\.[^"']+)["']/g)) {
      // Relative to the importer, then back to a dist-relative key.
      const resolved = relative(dist, resolve(dirname(path), m[1]))
      queue.push(resolved)
    }
  }
  return [...seen]
}

const gz = (files) =>
  gzipSync(Buffer.concat(files.map((f) => readFileSync(join(dist, f))))).length
const raw = (files) => files.reduce((n, f) => n + statSync(join(dist, f)).size, 0)

const BUDGETS = {
  // The published graph behind the default entry.
  'mayui.js': 90 * 1024,
  // Opt-in families. Importing 'mayui' pulls in neither.
  'desktop.js': 46 * 1024,
  'mobile.js': 39 * 1024,
  // The example screens. Never imported by a consumer — this budget exists to
  // catch them leaking into the main entry.
  'examples.js': 205 * 1024,
}

let failed = false
console.log('bundle budgets (transitive closure per entry)\n')

const closures = {}
for (const [entry, budget] of Object.entries(BUDGETS)) {
  const files = closure(entry)
  closures[entry] = files
  const gzipped = gz(files)
  const ok = gzipped <= budget
  if (!ok) failed = true
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${entry.padEnd(13)} ${String(raw(files)).padStart(7)} raw  ` +
      `${String(gzipped).padStart(6)} gz  / ${budget} budget  (${files.length} chunk${files.length === 1 ? '' : 's'}` +
      `${ok ? `, ${Math.round((gzipped / budget) * 100)}% used` : ''})`,
  )
}

// The load-bearing check: no example screen may be reachable from the library entry.
const mainFiles = new Set(closures['mayui.js'])
const exampleOnly = closures['examples.js'].filter((f) => !mainFiles.has(f))
const leaked = closures['mayui.js'].filter((f) => /examples/i.test(f))
const leakOk = leaked.length === 0
if (!leakOk) failed = true
console.log(
  `\n  ${leakOk ? 'ok  ' : 'FAIL'} examples do not leak into the library entry` +
    ` (${exampleOnly.length} chunk(s) exclusive to examples)`,
)

const STYLE_BUDGETS = {
  'mayui.js': 25 * 1024,
  'desktop.js': 11 * 1024,
  'mobile.js': 11 * 1024,
  'examples.js': 33 * 1024,
}

console.log('\nembedded React style resources (unique per entry)\n')
for (const [entry, budget] of Object.entries(STYLE_BUDGETS)) {
  const modules = entry === 'examples.js'
    ? Object.values(builtStyleEntries)
    : [builtStyleEntries[entry]]
  const sheets = new Map()
  for (const module of modules) {
    for (const sheet of styleSheetsFor(module)) sheets.set(sheet.href, sheet)
  }
  const source = [...sheets.values()].map((sheet) => sheet.css).join('\n')
  const compressed = gzipSync(source).length
  const ok = compressed <= budget
  if (!ok) failed = true
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${entry.padEnd(13)} ${String(source.length).padStart(7)} raw  ` +
      `${String(compressed).padStart(6)} gz  / ${budget} budget  (${sheets.size} resources)`,
  )
}

const cssAssets = readdirSync(dist).filter((file) => file.endsWith('.css'))
const noCssAssets = cssAssets.length === 0
if (!noCssAssets) failed = true
console.log(`\n  ${noCssAssets ? 'ok  ' : 'FAIL'} no emitted CSS assets`)

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const deps = Object.keys(pkg.dependencies ?? {})
/*
 * Both sanctioned runtime dependencies are deliberate and externalised: icons
 * supply the glyph system, while Motion projects SegmentedControl's real-sized
 * selection thumb. Anything else appearing here is an accident and fails.
 */
const ALLOWED_DEPS = new Set(['motion', 'react-icons'])
const depsOk = deps.every((d) => ALLOWED_DEPS.has(d))
if (!depsOk) failed = true
console.log(
  `\n  ${depsOk ? 'ok  ' : 'FAIL'} runtime dependencies: ${deps.length === 0 ? 'none' : deps.join(', ')}`,
)
console.log('       (motion and react-icons are external and consumer-tree-shaken;')
console.log('        easing-utils is a devDependency, compiled in at build time)')

process.exit(failed ? 1 : 0)
