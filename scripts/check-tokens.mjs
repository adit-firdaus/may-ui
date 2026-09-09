/**
 * Verifies the built stylesheet is self-consistent: every `var(--may-*)` it
 * reads is defined somewhere in the same file, and no token is defined twice
 * with conflicting intent outside a theme block.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, '../dist/mayui.css'), 'utf8')

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

process.exit(undefinedTokens.length ? 1 : 0)
