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
import { readFileSync } from 'node:fs'
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

if (failed) {
  console.error(`
       Either the script was renamed and the docs were not, or the docs
       describe something that never existed. Fix whichever is wrong.
`)
  process.exit(1)
}

console.log(`  ok   ${checked} documented command(s) all exist`)
