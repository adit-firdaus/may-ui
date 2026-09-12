/**
 * Coverage gate for the example screens.
 *
 * The examples exist to prove the system composes. That claim is only worth
 * anything if every component actually appears in one — otherwise "exercises
 * the whole library" quietly degrades into "exercises the easy half". This
 * fails the build when a component is exported but never used in an example.
 *
 * It reads the JSX, not the bundle: a component imported but never rendered
 * would still be a gap, so identifiers are matched against actual `<Name` use.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const examplesDir = join(root, 'src/examples')

/**
 * Components with nothing to see.
 *
 * These are structural or invisible by design, so requiring them to appear in a
 * screenshot-able example would push the examples toward contrivance rather
 * than realism. Each is covered by the SSR smoke test instead.
 */
const EXEMPT = new Set([
  'MayProvider', // supplied by the Storybook decorator and the gallery root
  'VisuallyHidden', // invisible by definition
  'SafeArea', // a spacer; the DeviceFrame demonstrates the inset mechanism
  'ScrollArea', // used via data-slot on plain divs throughout
  'DeviceFrame', // part of the example harness, not the library
  'initialsFrom', // a plain utility, not a component
])

function exportedComponents(dtsPath) {
  if (!existsSync(dtsPath)) return []
  const src = readFileSync(dtsPath, 'utf8')
  const names = new Set()
  for (const m of src.matchAll(/export declare (?:function|const) ([A-Z]\w*)/g)) names.add(m[1])
  return [...names]
}

const exported = new Set([
  ...exportedComponents(join(root, 'dist/index.d.ts')),
  ...exportedComponents(join(root, 'dist/desktop.d.ts')),
  ...exportedComponents(join(root, 'dist/mobile.d.ts')),
])

if (!exported.size) {
  console.error('no exports found — run the build first')
  process.exit(1)
}

const files = existsSync(examplesDir)
  ? readdirSync(examplesDir).filter((f) => f.endsWith('.tsx'))
  : []

const used = new Map() // component -> [files]
for (const file of files) {
  const src = readFileSync(join(examplesDir, file), 'utf8')
  for (const m of src.matchAll(/<([A-Z]\w*)/g)) {
    if (!exported.has(m[1])) continue
    if (!used.has(m[1])) used.set(m[1], new Set())
    used.get(m[1]).add(file)
  }
  // `toast()` is imperative — it never appears as JSX.
  if (/\btoast[.(]/.test(src)) {
    if (!used.has('Toast')) used.set('Toast', new Set())
    used.get('Toast').add(file)
  }
}

const missing = [...exported].filter((n) => !EXEMPT.has(n) && !used.has(n)).sort()
const covered = [...exported].filter((n) => used.has(n)).length
const target = [...exported].filter((n) => !EXEMPT.has(n)).length

console.log('example coverage\n')
console.log(`  example files: ${files.length}`)
console.log(`  components covered: ${covered}/${target}  (${EXEMPT.size} exempt)`)

if (missing.length) {
  console.log(`\n  FAIL ${missing.length} component(s) appear in no example:`)
  for (const n of missing) console.log(`    ${n}`)
  console.log('\n  Add them to a screen, or exempt them in scripts/check-coverage.mjs with a reason.')
  process.exit(1)
}

console.log('  ok   every component appears in at least one example')

// Surface the long tail: a component used exactly once is thinly covered.
const thin = [...used.entries()].filter(([, f]) => f.size === 1).map(([n]) => n)
if (thin.length) {
  console.log(`\n  note: ${thin.length} component(s) appear in exactly one example —`)
  console.log('        ' + thin.sort().join(', '))
}
