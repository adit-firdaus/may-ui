/**
 * Weight gate. "Lightweight" is only real if it is enforced.
 */
import { readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const gz = (p) => gzipSync(readFileSync(p)).length

const BUDGETS = {
  // The adaptive default — what every consumer pays.
  'dist/mayui.js': 34 * 1024,
  'dist/mayui.css': 34 * 1024,
  // Opt-in families. Importing 'mayui' pulls in neither.
  'dist/desktop.js': 22 * 1024,
  'dist/mobile.js': 22 * 1024,
}

let failed = false
console.log('bundle budgets\n')
for (const [file, budget] of Object.entries(BUDGETS)) {
  const path = resolve(root, file)
  const raw = statSync(path).size
  const gzipped = gz(path)
  const ok = gzipped <= budget
  if (!ok) failed = true
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${file.padEnd(18)} ${String(raw).padStart(7)} raw  ` +
      `${String(gzipped).padStart(6)} gz  / ${budget} budget` +
      `${ok ? ` (${Math.round((gzipped / budget) * 100)}% used)` : ''}`,
  )
}

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const deps = Object.keys(pkg.dependencies ?? {})
const depsOk = deps.length === 0
if (!depsOk) failed = true
console.log(
  `\n  ${depsOk ? 'ok  ' : 'FAIL'} runtime dependencies: ${deps.length === 0 ? 'none' : deps.join(', ')}`,
)
console.log('       (easing-utils is a devDependency — compiled in at build time)')

process.exit(failed ? 1 : 0)
