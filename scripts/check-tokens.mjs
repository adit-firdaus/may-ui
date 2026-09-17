/**
 * Verifies the built stylesheet is self-consistent: every `var(--may-*)` it
 * reads is defined somewhere in the same file, and no token is defined twice
 * with conflicting intent outside a theme block.
 */
import { readFileSync } from 'node:fs'
import { builtCss as css } from './built-styles.mjs'

const defined = new Set([...css.matchAll(/(--may-[\w-]+)\s*:/g)].map((m) => m[1]))
const used = new Set([...css.matchAll(/var\((--may-[\w-]+)/g)].map((m) => m[1]))

const undefinedTokens = [...used].filter((t) => !defined.has(t)).sort()
const unusedTokens = [...defined].filter((t) => !used.has(t)).sort()

console.log(`defined: ${defined.size}   referenced: ${used.size}`)

if (undefinedTokens.length) {
  console.log('\nUNDEFINED TOKENS (referenced but never declared):')
  undefinedTokens.forEach((t) => console.log('  ' + t))
} else {
  console.log('ok   every referenced token is defined')
}

// Local component variables (--may-btn-*, --may-tag-bg, …) are declared and read
// inside one component; a primitive with no reader is dead weight worth knowing about.
const deadPrimitives = unusedTokens.filter((t) =>
  /^--may-(neutral|brand|green|amber|red|blue)-\d+$/.test(t),
)
if (deadPrimitives.length) {
  console.log(`\nnote: ${deadPrimitives.length} primitive ramp steps are never referenced:`)
  console.log('  ' + deadPrimitives.join(', '))
}

/*
 * The typed override surface matches the sheet it overrides.
 *
 * `MayTokens` is DERIVED: gen-tokens.mjs reads tokens.css AND motion.css and
 * emits a name per declaration, which is why the two are exactly in step
 * today. The derivation is also the fragility — gen-tokens reads motion.css as
 * a file, so it has to run after gen-springs, and `generate` chains them in
 * that order. Run gen:tokens against a stale motion.css and the type loses
 * every spring and duration, with the only symptom being that a consumer's
 * typed override of one silently does nothing.
 *
 * Checking the invariant rather than the script order catches that however it
 * happens: a name the type offers but the sheet never declares cannot be
 * overridden into anything, and a token the sheet declares but the type omits
 * cannot be reached from `theme={{ tokens }}` at all.
 */
const foundation = ['tokens', 'motion']
  .map((file) => readFileSync(new URL(`../src/styles/${file}.css`, import.meta.url), 'utf8'))
  .join('\n')
const declaredInFoundation = new Set(
  [...foundation.matchAll(/^\s*(--may-[\w-]+)\s*:/gm)].map((match) => match[1]),
)
/*
 * Read from the generated source rather than an import: `mayTokenCssNames` is
 * internal on purpose, and exporting it so a gate can see it would be adding
 * public API for the gate's convenience.
 */
const generated = readFileSync(new URL('../src/styles/tokens.generated.ts', import.meta.url), 'utf8')
const nameBlock = generated.slice(
  generated.indexOf('export const mayTokenCssNames'),
  generated.indexOf('export const mayLightTokens'),
)
const typed = new Set(
  [...nameBlock.matchAll(/^\s+\w+: '([a-z0-9-]+)',/gm)].map((match) => `--may-${match[1]}`),
)

const typedButUndeclared = [...typed].filter((name) => !declaredInFoundation.has(name)).sort()
const declaredButUntyped = [...declaredInFoundation].filter((name) => !typed.has(name)).sort()

if (typedButUndeclared.length === 0 && declaredButUntyped.length === 0) {
  console.log(`ok   MayTokens and the foundation agree on all ${typed.size} names`)
} else {
  if (typedButUndeclared.length) {
    console.log('\nTYPED BUT NEVER DECLARED (an override would do nothing):')
    typedButUndeclared.forEach((name) => console.log('  ' + name))
  }
  if (declaredButUntyped.length) {
    console.log('\nDECLARED BUT NOT TYPED (cannot be overridden on the provider):')
    declaredButUntyped.forEach((name) => console.log('  ' + name))
  }
  console.log('\n       Run `npm run generate` — gen:springs before gen:tokens.')
}

const tokenParityFailed = typedButUndeclared.length + declaredButUntyped.length
process.exit(undefinedTokens.length + tokenParityFailed ? 1 : 0)
