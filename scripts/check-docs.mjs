/**
 * Documented commands exist.
 *
 * `README.md` and `AGENTS.md` both told the reader that `npm run dev` starts a
 * "Vite playground". It starts Storybook, and has for as long as the line has
 * been wrong — nothing reads the docs, so nothing noticed. An agent following
 * AGENTS.md runs the command and gets something other than what it was
 * promised, which is the expensive kind of wrong.
 *
 * Cheap to check and it only ever fires on a real mismatch: every `npm run X`
 * written in the docs must be a script that exists.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(resolve(root, file), 'utf8')

const scripts = new Set(Object.keys(JSON.parse(read('package.json')).scripts))
const DOCS = ['README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'docs/getting-started.md']

console.log('documented commands\n')

let failed = false
let checked = 0

for (const file of DOCS) {
  let source
  try {
    source = read(file)
  } catch {
    continue
  }
  // `npm run <name>`; the name stops at whitespace or a shell/markdown delimiter.
  for (const match of source.matchAll(/npm run ([a-z][\w:-]*)/g)) {
    const name = match[1]
    checked++
    if (scripts.has(name)) continue
    const line = source.slice(0, match.index).split('\n').length
    console.error(`  FAIL ${relative(root, resolve(root, file))}:${line} — \`npm run ${name}\` is not a script`)
    failed = true
  }
}

/*
 * Counts drift silently.
 *
 * The README advertised 74 components until Combobox landed and made it 75, and
 * nothing would have caught the stale number — the same class of bug as the
 * changelog claiming a button cost 22 kB after it had become 6.8 kB. A number
 * in prose is a claim, and claims are checkable.
 */
const counted = {
  components: ['src/components', 'src/desktop', 'src/mobile'].reduce(
    (total, dir) => total + readdirSync(resolve(root, dir)).length,
    0,
  ),
}

for (const [label, actual] of Object.entries(counted)) {
  const pattern = new RegExp(`(\\d+) ${label}\\b`)
  for (const file of DOCS) {
    let source
    try {
      source = read(file)
    } catch {
      continue
    }
    const found = source.match(pattern)
    if (!found) continue
    checked++
    if (Number(found[1]) === actual) continue
    const line = source.slice(0, found.index).split('\n').length
    console.error(`  FAIL ${file}:${line} — says ${found[1]} ${label}, there are ${actual}`)
    failed = true
  }
}

/*
 * Every public export is mentioned somewhere a consumer reads.
 *
 * An undocumented export is still API: it is semver-bound, a consumer cannot
 * discover it, and nobody can safely change it. Two were in that state —
 * `useLinkComponent` and `useKeyboardInset`, both of them precisely the seam
 * someone needs to write a component that behaves like one of May's rather
 * than merely looking like it.
 *
 * Mentioned is a low bar on purpose. It is not a promise of prose, only that
 * adding an export makes someone write the name down once.
 */
const READERS = [...DOCS, 'docs/theming.md', 'docs/motion.md', 'CHANGELOG.md', 'llms.txt']
const prose = READERS.map((file) => {
  try {
    return read(file)
  } catch {
    return ''
  }
}).join('\n')

const entries = { '.': 'mayui', './desktop': 'desktop', './mobile': 'mobile' }
const undocumented = []
for (const [subpath, file] of Object.entries(entries)) {
  let exported
  try {
    exported = Object.keys(await import(resolve(root, `dist/${file}.js`)))
  } catch {
    continue
  }
  for (const name of exported) {
    checked++
    if (new RegExp(`\\b${name}\\b`).test(prose)) continue
    undocumented.push(`${name} (${subpath})`)
  }
}
if (undocumented.length) {
  console.error(`  FAIL ${undocumented.length} export(s) are documented nowhere:`)
  undocumented.forEach((name) => console.error(`       ${name}`))
  failed = true
}

if (failed) {
  console.error(`
       A command was renamed and the docs were not, a doc describes
       something that never existed, or a count moved when a component was
       added. Fix whichever it is — the docs are a claim, not a comment.
`)
  process.exit(1)
}

console.log(`  ok   ${checked} documented command(s) and count(s) all check out`)
