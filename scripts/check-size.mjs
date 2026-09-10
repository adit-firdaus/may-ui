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
import { readFileSync, statSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

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
  'mayui.js': 44 * 1024,
  // Opt-in families. Importing 'mayui' pulls in neither.
  'desktop.js': 26 * 1024,
  'mobile.js': 26 * 1024,
  // The example screens. Never imported by a consumer — this budget exists to
  // catch them leaking into the main entry.
  'examples.js': 145 * 1024,
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

const cssPath = join(dist, 'mayui.css')
const cssGz = gzipSync(readFileSync(cssPath)).length
const CSS_BUDGET = 40 * 1024
const cssOk = cssGz <= CSS_BUDGET
if (!cssOk) failed = true
console.log(
  `  ${cssOk ? 'ok  ' : 'FAIL'} mayui.css   ${String(statSync(cssPath).size).padStart(7)} raw  ` +
    `${String(cssGz).padStart(6)} gz  / ${CSS_BUDGET} budget`,
)
console.log(
  '       (one stylesheet by design: cssCodeSplit is off so the design-sync',
)
console.log(
  '        @import closure resolves. It therefore also carries the example',
)
console.log('        screens’ CSS — a few hundred bytes gzipped.)')

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const deps = Object.keys(pkg.dependencies ?? {})
/*
 * react-icons is the one sanctioned runtime dependency: the icon set is a
 * deliberate design decision, and it is externalised in the build so the
 * consumer's bundler tree-shakes it per icon. Anything else appearing here is
 * an accident and should fail.
 */
const ALLOWED_DEPS = new Set(['react-icons'])
const depsOk = deps.every((d) => ALLOWED_DEPS.has(d))
if (!depsOk) failed = true
console.log(
  `\n  ${depsOk ? 'ok  ' : 'FAIL'} runtime dependencies: ${deps.length === 0 ? 'none' : deps.join(', ')}`,
)
console.log('       (react-icons is external and tree-shaken per icon by the consumer;')
console.log('        easing-utils is a devDependency, compiled in at build time)')

process.exit(failed ? 1 : 0)
