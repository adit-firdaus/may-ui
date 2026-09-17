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

const GENERATED = [
  'src/styles/tokens.css',
  'src/styles/motion.css',
  'src/styles/tokens.generated.ts',
]

console.log('generated-file drift\n')

let diff = ''
try {
  diff = execFileSync('git', ['diff', '--name-only', '--', ...GENERATED], {
    encoding: 'utf8',
  })
} catch {
  // No git (a published tarball, a vendored copy). Nothing to compare against,
  // and failing here would break a build that is not doing anything wrong.
  console.log('  skip git unavailable — nothing to compare against')
  process.exit(0)
}

const dirty = diff.split('\n').filter(Boolean)

if (dirty.length === 0) {
  console.log(`  ok   ${GENERATED.length} generated file(s) match their generators`)
  process.exit(0)
}

console.error('  FAIL the committed output disagrees with the generators:\n')
for (const file of dirty) console.error(`         ${file}`)
console.error(`
       Edit scripts/gen-tokens.mjs or scripts/gen-springs.mjs and run
       \`npm run generate\`, then commit the regenerated files. Never edit
       the generated artifacts directly.
`)
process.exit(1)
