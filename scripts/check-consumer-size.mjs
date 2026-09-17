/**
 * What a consumer actually downloads.
 *
 * `check-size.mjs` weighs the dist graph, which is the tarball's problem, not
 * the app's: it counts the per-module import/export boilerplate that a
 * consumer's bundler strips on the way in. That metric said nothing about the
 * bug this gate exists for.
 *
 * The bug: every component barrel made two unannotated top-level calls, so no
 * bundler could drop any of them, and `import { Button }` pulled in the CSS
 * and implementation of all 74 components — 68.9 kB gzipped, against 70.2 kB
 * for the entire library. Tree-shaking was doing nothing and nothing measured
 * it, because the shipped bytes had not changed.
 *
 * So this bundles a real import the way an app would and weighs the result.
 * The full-library figure is the control: if it ever DROPS sharply, something
 * a consumer asked for is being shaken out.
 */
import { build } from 'esbuild'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'dist/mayui.js')

/** Peers and runtime deps are the consumer's, not ours. */
const external = ['react', 'react-dom', 'react/jsx-runtime', 'react-icons/io5', 'motion/react']

const CASES = [
  { name: 'one component', names: ['Button'], budget: 12 * 1024 },
  { name: 'six components', names: ['Button', 'Card', 'Stack', 'Text', 'Input', 'Switch'], budget: 18 * 1024 },
]
/** Everything, as the control. A floor as well as a ceiling. */
const ALL = { name: 'whole library', min: 60 * 1024, max: 80 * 1024 }

async function weigh(source) {
  const out = await build({
    stdin: { contents: source, resolveDir: root, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    external,
    logLevel: 'silent',
  })
  return gzipSync(out.outputFiles[0].contents).length
}

console.log('consumer bundle weight (gzipped, esbuild, peers external)\n')

let failed = false

for (const { name, names, budget } of CASES) {
  const source = `import { ${names.join(', ')} } from ${JSON.stringify(entry)}\nconsole.log(${names.join(', ')})\n`
  const size = await weigh(source)
  const ok = size <= budget
  if (!ok) failed = true
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(16)} ${String(size).padStart(6)} gz / ${budget} budget` +
      `  (${Math.round((size / budget) * 100)}% used)`,
  )
}

const allSize = await weigh(
  `import * as M from ${JSON.stringify(entry)}\nconsole.log(M)\n`,
)
const allOk = allSize >= ALL.min && allSize <= ALL.max
if (!allOk) failed = true
console.log(
  `  ${allOk ? 'ok  ' : 'FAIL'} ${ALL.name.padEnd(16)} ${String(allSize).padStart(6)} gz / ` +
    `${ALL.min}–${ALL.max} expected`,
)
if (!allOk && allSize < ALL.min) {
  console.error(`
       The whole library got SMALLER than the floor. That is not a win: it
       means exports a consumer asked for are being tree-shaken away. Check
       the export counts in dist/*.d.ts before touching this floor.
`)
}

if (failed) process.exit(1)
