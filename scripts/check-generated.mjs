/**
 * Generated-file drift.
 *
 * `AGENTS.md` calls "never hand-edit tokens.css / motion.css" a hard rule, but
 * nothing enforced it. Both files are tracked, and `npm run build` regenerates
 * them IN PLACE — so a hand-edit was silently overwritten in CI rather than
 * failing, and the edit came back as an unexplained diff on someone else's
 * branch. A rule nothing checks is a comment.
 *
 * Runs after `build` has regenerated: if the tree is dirty, the committed
 * output disagrees with the generators, which means either someone edited the
 * artifact instead of the generator, or a generator change was committed
 * without its output.
 */
import { execFileSync } from 'node:child_process'

/** Each artifact paired with the generator that writes it. */
const GENERATED = {
  'src/styles/tokens.css': 'scripts/gen-tokens.mjs',
  'src/styles/tokens.generated.ts': 'scripts/gen-tokens.mjs',
  'src/styles/motion.css': 'scripts/gen-springs.mjs',
}

console.log('generated-file drift\n')

let diff = ''
try {
  diff = execFileSync('git', ['diff', '--name-only', '--', ...Object.keys(GENERATED)], {
    encoding: 'utf8',
  })
} catch {
  // No git (a published tarball, a vendored copy). Nothing to compare against,
  // and failing here would break a build that is not doing anything wrong.
  console.log('  skip git unavailable — nothing to compare against')
  process.exit(0)
}

const dirty = diff.split('\n').filter(Boolean)

/*
 * A dirty artifact is only drift if ITS OWN generator is clean.
 *
 * Editing a generator and rebuilding necessarily changes that generator's
 * output, and both are then uncommitted together — the normal way to make a
 * token change, not a violation. But the pairing has to be per artifact: an
 * earlier version exempted every artifact whenever any generator was dirty,
 * and a hand-edit of motion.css sailed through because gen-tokens.mjs happened
 * to be modified. In CI the tree starts clean, so nothing is ever exempt there.
 */
const modified = (paths) => {
  try {
    return execFileSync('git', ['diff', '--name-only', '--', ...paths], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
  } catch {
    return []
  }
}

const dirtyGenerators = new Set(modified([...new Set(Object.values(GENERATED))]))
const drifted = dirty.filter((file) => !dirtyGenerators.has(GENERATED[file]))
const excused = dirty.filter((file) => dirtyGenerators.has(GENERATED[file]))

for (const file of excused) {
  console.log(`  ok   ${file} changed alongside ${GENERATED[file]}`)
}

if (drifted.length === 0 && excused.length > 0) process.exit(0)

if (drifted.length === 0) {
  console.log(`  ok   ${Object.keys(GENERATED).length} generated file(s) match their generators`)
  process.exit(0)
}

console.error('  FAIL the committed output disagrees with the generators:\n')
for (const file of drifted) console.error(`         ${file}`)
console.error(`
       Edit scripts/gen-tokens.mjs or scripts/gen-springs.mjs and run
       \`npm run generate\`, then commit the regenerated files. Never edit
       the generated artifacts directly.
`)
process.exit(1)
