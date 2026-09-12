/**
 * Weight gate. "Lightweight" is only real if it is enforced.
 *
 * This measures each entry's TRANSITIVE CLOSURE, not the entry file. Rollup
 * hoists code shared between entries into separate chunks, so once a fourth
 * entry was added `dist/mayui.js` shrank from 124kB to a 4.7kB re-export shim
 * over a 121kB chunk. Measuring the entry file alone would have reported a 96%
 * size *improvement* while the real cost to a consumer was unchanged — a gate
 * that passes for the wrong reason is worse than no gate.
 */
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { builtStyleEntries, styleSheetsFor } from './built-styles.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const dist = join(root, 'dist')

/** Follow static imports/re-exports from an entry and return every file reached. */
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
    for (const m of src.matchAll(/(?:from|import)\s*["'](\.\/[^"']+)["']/g)) {
      queue.push(m[1].replace(/^\.\//, ''))
    }
  }
  return [...seen]
}

const gz = (files) =>
  gzipSync(Buffer.concat(files.map((f) => readFileSync(join(dist, f))))).length
const raw = (files) => files.reduce((n, f) => n + statSync(join(dist, f)).size, 0)

const BUDGETS = {
  // What every consumer of `mayui` pays.
  'mayui.js': 82 * 1024,
  // Opt-in families. Importing 'mayui' pulls in neither.
  'desktop.js': 43 * 1024,
  'mobile.js': 36 * 1024,
  // The example screens. Never imported by a consumer — this budget exists to
  // catch them leaking into the main entry.
  'examples.js': 171 * 1024,
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
