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

/*
 * The runtime dependencies stay shakeable.
 *
 * README tells a consumer their bundler will shake the icons and the Motion
 * features they do not use, and every measurement above externalises both —
 * which ASSUMES that claim rather than testing it. `motion` is imported by
 * exactly one component, SegmentedControl, so a Button-only bundle reaching
 * into it would mean a consumer paying for a component they never named.
 *
 * Measured as BYTES IN THE OUTPUT, which took two tries to get right.
 * Grepping the minified text for names like `useDragControls` finds nothing
 * whether or not the module is there, because the minifier has renamed them —
 * a check that could never fail. Switching to `metafile.inputs` then failed
 * even on a clean tree, because that lists every module esbuild READ, including
 * the ones it went on to shake out. `outputs[].inputs[].bytesInOutput` is the
 * only one of the three that answers the question asked.
 */
const bundled = await build({
  stdin: {
    contents: `import { Button } from ${JSON.stringify(entry)}\nconsole.log(Button)\n`,
    resolveDir: root,
    loader: 'js',
  },
  bundle: true,
  minify: true,
  format: 'esm',
  write: false,
  metafile: true,
  // react stays external; motion and react-icons deliberately do NOT.
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  logLevel: 'silent',
})

/** Bytes a dependency contributes to a built output, by path pattern. */
const contributionOf = (meta, pattern) =>
  Object.values(meta.outputs).flatMap((out) =>
    Object.entries(out.inputs ?? {})
      .filter(([file, info]) => pattern.test(file) && info.bytesInOutput > 0)
      .map(([file, info]) => ({ file, bytes: info.bytesInOutput })),
  )

const pulled = contributionOf(bundled.metafile, /node_modules\/(motion|framer-motion)\//).map(
  ({ file, bytes }) => `${file} (${bytes}B)`,
)

/*
 * The icons shake too, and the same README sentence covers them.
 *
 * `react-icons/io5` is one barrel module holding every Ionicon, so the whole
 * claim rests on the bundler shaking it. Button names no icon at all, which
 * makes it the clean zero case; the whole library pulls the shared icon
 * runtime plus the subset it actually uses, and the ceiling is what would
 * catch the barrel stopping shaking — an unshaken io5 is hundreds of
 * kilobytes, not single digits.
 */
const iconsInButton = contributionOf(bundled.metafile, /node_modules\/react-icons\//)

const everything = await build({
  stdin: {
    contents: `import * as M from ${JSON.stringify(entry)}\nconsole.log(M)\n`,
    resolveDir: root,
    loader: 'js',
  },
  bundle: true,
  minify: true,
  format: 'esm',
  write: false,
  metafile: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  logLevel: 'silent',
})
const iconsInAll = contributionOf(everything.metafile, /node_modules\/react-icons\//)
const iconBytes = iconsInAll.reduce((total, { bytes }) => total + bytes, 0)
const ICON_CEILING = 16 * 1024

console.log('')
if (pulled.length === 0) {
  console.log('  ok   no Motion module contributes bytes to a Button-only bundle')
} else {
  failed = true
  console.error(`  FAIL ${pulled.length} Motion module(s) contribute bytes to a Button-only bundle`)
  console.error(`         e.g. ${pulled.slice(0, 3).join(', ')}`)
  console.error(`
       motion is imported by SegmentedControl alone. If it reaches a Button
       bundle, something outside that component now depends on it and every
       consumer pays for it.
`)
}

if (iconsInButton.length === 0) {
  console.log('  ok   no icon module contributes bytes to a Button-only bundle')
} else {
  failed = true
  console.error(
    `  FAIL ${iconsInButton.length} icon module(s) reach a Button-only bundle, which names no icon`,
  )
}

if (iconBytes <= ICON_CEILING) {
  console.log(
    `  ok   the whole library's icons cost ${iconBytes} B / ${ICON_CEILING} ceiling ` +
      `(${iconsInAll.length} modules)`,
  )
} else {
  failed = true
  console.error(`  FAIL the icons cost ${iconBytes} B, over the ${ICON_CEILING} ceiling`)
  console.error(`
       react-icons/io5 is one barrel holding every Ionicon. A number this
       large means the bundler has stopped shaking it and every consumer is
       paying for icons nobody named.
`)
}

/*
 * The demo screens never reach a consumer who did not ask for them.
 *
 * `src/examples` is a fourth entry precisely so importing `mayui` cannot pull
 * a demo screen in, and check-size already asserts that against the published
 * graph. This is the consumer's side of it, and it checks the case that graph
 * check cannot: a namespace import of the whole main entry, which is the
 * shape most likely to drag something unintended along.
 */
const exampleBytes = contributionOf(everything.metafile, /src\/examples\//).reduce(
  (total, { bytes }) => total + bytes,
  0,
)

if (exampleBytes === 0) {
  console.log('  ok   no demo screen reaches a namespace import of the main entry')
} else {
  failed = true
  console.error(`  FAIL demo screens contribute ${exampleBytes} B to the main entry`)
  console.error(`
       The screens are a separate entry so nobody pays for them by accident.
       Something in src/ now imports one — find it rather than raising a
       budget.
`)
}

if (failed) process.exit(1)
