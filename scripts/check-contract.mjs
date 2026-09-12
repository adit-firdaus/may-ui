/**
 * The design contract, enforced.
 *
 * These are the rules that make May UI read as native rather than as a web
 * page, and every one of them is easy to break by accident in a single
 * component. Asserting them here means a regression fails the build instead of
 * quietly shipping.
 */
import { builtCss as css } from './built-styles.mjs'

/** Strip every @media (hover: hover) block, so what remains is unguarded. */
function stripHoverGuards(source) {
  let out = ''
  let i = 0
  while (i < source.length) {
    const found = source.slice(i).match(/@media\s*\(\s*hover\s*:\s*hover/)
    const start = found ? i + found.index : -1
    if (start === -1) {
      out += source.slice(i)
      break
    }
    out += source.slice(i, start)
    let depth = 0
    let j = source.indexOf('{', start)
    for (; j < source.length; j++) {
      if (source[j] === '{') depth++
      else if (source[j] === '}' && --depth === 0) break
    }
    i = j + 1
  }
  return out
}

const unguarded = stripHoverGuards(css)

/**
 * Every style rule in the sheet, as [selector, body].
 *
 * At-rules are RECURSED INTO rather than skipped, which is load-bearing: the
 * whole sheet ships wrapped in `@layer may-ui`, so a parser that treated an
 * at-rule as one opaque rule would find no style rules at all and every check
 * built on this would pass vacuously.
 */
function rules(source) {
  const out = []
  let depth = 0
  let buf = ''
  let sel = ''
  for (const ch of source) {
    if (ch === '{') {
      if (depth === 0) {
        sel = buf.trim()
        buf = ''
      } else buf += ch
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) {
        // An at-rule wraps more rules; a style rule's body is declarations.
        if (sel.startsWith('@')) out.push(...rules(buf))
        else out.push([sel, buf])
        buf = ''
      } else buf += ch
    } else buf += ch
  }
  return out
}

/** The class-like half of specificity: classes, attributes and pseudo-classes. */
function weight(selector) {
  const bare = selector.replace(/:where\([^)]*\)/g, '')
  return (
    (bare.match(/\.[\w-]+/g) ?? []).length +
    (bare.match(/\[[^\]]+\]/g) ?? []).length +
    (bare.match(/:(?!:)(?!where)[\w-]+/g) ?? []).length
  )
}

/**
 * A rule that paints — sets `color` or `background` — but names no component
 * of its own is a RESET. It has to lose to every component rule, and at equal
 * specificity it does not: a tie breaks on source order, and base.css is
 * imported last. That is exactly how `.may-root [type='button']` (0,2,0) came
 * to tie `.may-button[data-variant='filled']` and strip the background off
 * every May control that renders `type="button"` — the selected segment and
 * the current page drew black-on-blue, unreadable against their own thumb.
 *
 * Pseudo-elements are exempt: `::selection` and the scrollbar parts are not
 * the component's own box, so they cannot collide with its rules.
 */
const overreachingResets = rules(css)
  .filter(([sel, body]) => sel && !sel.startsWith('@') && /(^|;|\s)(color|background|background-color)\s*:/.test(body))
  .flatMap(([sel]) => sel.split(',').map((one) => one.trim()))
  .filter((sel) => sel && !sel.includes('::'))
  // A component rule names its own class; `may-root` is the scope, not a component.
  .filter((sel) => !/\.may-(?!root\b)[\w-]+/.test(sel))
  .filter((sel) => weight(sel) > 1)


const checks = [
  [
    'no backdrop-filter anywhere — surfaces separate by value, not translucency',
    !/backdrop-filter/.test(css),
  ],
  [
    'no visible strokes on controls — fills replace borders',
    !(css.match(/border[a-z-]*:[^;]*solid[^;]*/g) ?? []).some(
      (d) => !/transparent|currentColor/.test(d),
    ),
  ],
  [
    'every :hover sits inside a (hover: hover) block — no sticky hover on touch',
    !unguarded.replace(/[^{}]*::-webkit-scrollbar[^{}]*\{[^}]*\}/g, '').includes(':hover'),
  ],
  [
    'interactive chrome is unselectable',
    /user-select:\s*none/.test(css) && /-webkit-touch-callout:\s*none/.test(css),
  ],
  [
    'body copy stays selectable',
    /user-select:\s*text/.test(css),
  ],
  [
    'tap highlight and 300ms delay are suppressed',
    /-webkit-tap-highlight-color:\s*transparent/.test(css) &&
      /touch-action:\s*manipulation/.test(css),
  ],
  [
    'dark redefines the full shadow ramp (a1-a7), not just the light one',
    Array.from({ length: 7 }, (_, i) => `--may-shadow-a${i + 1}`).every(
      (t) => (css.match(new RegExp(`${t}\\s*:`, 'g')) ?? []).length >= 3,
    ),
  ],
  [
    'scoped dark re-resolves the SEMANTIC aliases, not just the primitives',
    // A custom property that says `var(--primitive)` is substituted where it is
    // DECLARED. Declaring the aliases only on :root made them resolve against
    // the light primitives, so `<div data-may-theme="dark">` changed the
    // primitives beneath an already-resolved alias and rendered light. The
    // earlier version of this test checked that dark redefined the primitives —
    // which it did — and missed that nothing downstream re-resolved.
    (() => {
      const block = css.match(/\[data-may-theme=["']?dark["']?\]\s*\{([^}]*)\}/)?.[1] ?? ''
      return (
        /--may-color-bg\s*:/.test(block) &&
        /--may-color-text\s*:/.test(block) &&
        /--may-shadow-lg\s*:/.test(block)
      )
    })(),
  ],
  [
    'a scoped theme re-asserts inherited color, not only the tokens',
    // Tokens alone do not fix a scoped theme: `color` is inherited, so it was
    // already resolved on .may-root against the outer theme and does not
    // re-resolve when the tokens beneath it change. Found by screenshotting the
    // dark-pinned NowPlaying screen: every transport control rendered black on
    // black, because IconButton has no colour of its own and inherits.
    /\[data-may-theme\]\s*\{[^}]*color:\s*var\(--may-color-text\)/.test(css),
  ],
  [
    'reduced motion stops iteration, not just duration',
    /animation-iteration-count:\s*1\s*!important/.test(css),
  ],
  [
    'hairlines are true device pixels',
    /min-resolution:\s*2dppx/.test(css) && /--may-hairline/.test(css),
  ],
  [
    'the tint/primary split survives (brand-as-text vs brand-as-fill)',
    /--may-color-tint:/.test(css) && /--may-color-primary:/.test(css),
  ],
  [
    'spring curves are real linear() samples, not cubic-bezier stand-ins',
    /--may-spring-bouncy:\s*linear\(/.test(css),
  ],
  [
    'bouncy actually overshoots past 1',
    (() => {
      const m = css.match(/--may-spring-bouncy:\s*linear\(([^)]+)\)/)
      return !!m && m[1].split(',').some((n) => parseFloat(n) > 1)
    })(),
  ],
  [
    'a linear() fallback exists for older browsers',
    /@supports not \(animation-timing-function: linear/.test(css),
  ],
  [
    'element resets cannot out-specify the components they paint over',
    overreachingResets.length === 0 ||
      (console.log(`\n       offending selector(s): ${overreachingResets.join(', ')}`), false),
  ],
]

let bad = 0
console.log('design contract\n')
for (const [label, ok] of checks) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) bad++
}
process.exit(bad ? 1 : 0)
