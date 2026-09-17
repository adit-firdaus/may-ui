/**
 * The design contract, enforced.
 *
 * These are the rules that make May UI read as native rather than as a web
 * page, and every one of them is easy to break by accident in a single
 * component. Asserting them here means a regression fails the build instead of
 * quietly shipping.
 */
import { builtCss as css } from './built-styles.mjs'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const srcRoot = new URL('../src/', import.meta.url).pathname

/** Every .ts/.tsx under src/, excluding stories. */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(path))
    else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.stories.')) out.push(path)
  }
  return out
}

/*
 * Refuse an empty source list, for the same reason built-styles refuses an
 * empty stylesheet: most assertions here read "no file does X", which is true
 * of no files at all. Measured — with the walk stubbed to match nothing, 26
 * assertions printed `ok`, and the suite only failed because one of them
 * happens to check that it matched something.
 *
 * The floor is far below the real count so it catches a broken path or a
 * changed extension filter, not growth.
 */
const FLOOR_SOURCES = 150
let discovered = null
function sources() {
  if (discovered) return discovered
  const found = walk(srcRoot)
  if (found.length < FLOOR_SOURCES) {
    throw new Error(
      `check-contract found only ${found.length} source file(s) under ${srcRoot}, expected at least ` +
        `${FLOOR_SOURCES}. Every source assertion below is vacuous until this is fixed.`,
    )
  }
  discovered = found
  return discovered
}

/*
 * Dismissal must go through the shared layer stack.
 *
 * Sheet and Popover each used to register a CAPTURE-phase `keydown` on
 * `document`. Two listeners on the same node fire in registration order, and
 * `stopPropagation` does not suppress a sibling on that node — so the Sheet,
 * having opened first, always heard Escape first and a Popover inside it took
 * the Sheet down too. `src/overlay/layers.ts` answers "who is on top" directly
 * instead of inferring it from listener order; this keeps everyone on it.
 *
 * Two global hotkeys are legitimately not dismissals and stay exempt: the
 * palette's own ⌘K toggle, and Kbd, which paints whichever key is held.
 */
const KEYDOWN_EXEMPT = ['desktop/CommandPalette/CommandPalette.tsx', 'components/Kbd/Kbd.tsx']
const rogueKeydown = sources()
  .filter((file) => {
    const rel = relative(srcRoot, file)
    if (rel.startsWith('overlay/') || KEYDOWN_EXEMPT.includes(rel)) return false
    return /addEventListener\(\s*['"]keydown['"]/.test(readFileSync(file, 'utf8'))
  })
  .map((file) => relative(srcRoot, file))

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
const thumbRuntime = readFileSync(new URL('../src/motion/sliding-thumb.ts', import.meta.url), 'utf8')

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

const ruleBody = (selector) => rules(css).find(([candidate]) => candidate === selector)?.[1] ?? ''
const segmentedLabel = ruleBody('.may-segmented__label')
const segmentedCss = rules(css)
  .filter(([selector]) => selector.includes('.may-segmented') && selector !== '.may-segmented__label')
  .map(([, body]) => body)
  .join(';')


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
  /*
   * The exported token VALUES carry the springs too, not the fallback.
   *
   * The check above proves the sheet ships real samples. It said nothing
   * about `mayLightTokens` / `mayDarkTokens`, which back `useMayTokens()` —
   * and those were wrong: gen-tokens parsed motion.css flat, so the
   * `cubic-bezier` stand-in inside `@supports not (…)` overwrote the real
   * value on position alone. Every spring and ease a consumer read from the
   * hook was the legacy curve, while the components animated on the samples.
   *
   * The expected set is read from motion.css rather than matched on names.
   * A first attempt keyed on /^(spring|ease)/ and flagged easeOut and
   * easeStandard, which are genuinely cubic-bezier, along with the duration
   * companions — a check that fails on correct code is worse than none.
   */
  [
    'the exported token values carry linear() springs, not the fallback',
    (() => {
      const motion = readFileSync(new URL('../src/styles/motion.css', import.meta.url), 'utf8')
      const root = motion.slice(0, motion.indexOf('@supports') + 1 || undefined)
      const shouldBeLinear = [...root.matchAll(/--may-([\w-]+)\s*:\s*(linear\([^;]*)/g)].map(
        ([, name]) => name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase()),
      )

      const generated = readFileSync(
        new URL('../src/styles/tokens.generated.ts', import.meta.url),
        'utf8',
      )
      const wrong = shouldBeLinear.filter((name) => {
        const found = new RegExp(`^ {2}${name}: "([^"]*)"`, 'm').exec(generated)
        return !found || !found[1].startsWith('linear(')
      })

      return (
        shouldBeLinear.length > 0 &&
        (wrong.length === 0 ||
          (console.log(
            `\n       ${wrong.length} curve(s) exported as the fallback: ${wrong.join(', ')}`,
          ),
          false))
      )
    })(),
  ],
  [
    'a linear() fallback exists for older browsers',
    /@supports not \(animation-timing-function: linear/.test(css),
  ],
  [
    'sliding-thumb motion stays on compositor properties',
    !/box-shadow\s+\$\{TINT_MS\}/.test(thumbRuntime) &&
      !/transition:/.test(segmentedCss) &&
      /transition:\s*opacity\s+var\(--may-duration-fast\)\s+var\(--may-ease-out\)/.test(segmentedLabel),
  ],
  /*
   * Every directional glyph mirrors under RTL.
   *
   * The library supports RTL deliberately — Switch, Steps, Breadcrumb,
   * SearchBar and NavBar all carry [dir='rtl'] rules — but four chevrons had
   * been missed, so a disclosure row mirrored its LAYOUT and then pointed the
   * wrong way inside it. The layout half is free from logical properties; the
   * glyph half never is, and that asymmetry is exactly what makes it easy to
   * forget on the next component.
   */
  [
    'every directional chevron mirrors under RTL',
    (() => {
      const directional = [
        'may-list-row__chevron',
        'may-collapsible__chevron',
        'may-sidebar-section__chevron',
        'may-menu__chevron',
        'may-navtree__twisty',
        'may-pagination__arrow',
        'may-breadcrumb__separator',
        'may-nav-bar__chevron',
        'may-nav-bar__back-chevron',
      ]
      const missing = directional.filter((cls) => {
        // a [dir='rtl'] rule naming this class, anywhere in the built sheet
        // The build strips the quotes: [dir='rtl'] ships as [dir=rtl].
        /*
         * The BODY has to carry a transform, not merely mention the class. A
         * first version of this check only looked for the selector and passed
         * happily against a rule whose declaration had been gutted to
         * `opacity: 1` — the same outcome as no rule at all.
         */
        const re = new RegExp(`\\[dir=['"]?rtl['"]?\\][^{}]*\\.${cls}\\b[^{}]*\\{([^}]*)\\}`)
        const found = css.match(re)
        return !found || !/transform\s*:/.test(found[1])
      })
      return (
        missing.length === 0 ||
        (console.log(`\n       no [dir='rtl'] rule for: ${missing.join(', ')}`), false)
      )
    })(),
  ],
  /*
   * A component that takes className takes the rest too.
   *
   * Eight components accepted `className` and forwarded nothing else, so
   * `data-testid` for an e2e run, an `id`, or an extra `aria-*` were all
   * refused — while Modal's own prop comment called that set "the things every
   * other component already allows". The claim is what made it invisible.
   */
  /*
   * No component sizes its icons behind a width guard.
   *
   * react-icons emits `width="1em"` as an ATTRIBUTE, so
   * `svg:not([width])` never matches one and a rule written that way silently
   * does nothing — the glyph keeps whatever size it came with and the CSS looks
   * correct while having no effect. The one such rule in base.css is the other
   * side of the same fact: a floor for raw unclassed svgs, which react-icons
   * cannot match, and it lives outside the component sheets this checks.
   */
  /*
   * Tone sets variables; variant consumes them.
   *
   * The separation is what lets a new tone be five custom properties instead
   * of a new rule in every variant, and a new variant one rule instead of one
   * per tone. The moment a [data-tone] rule paints directly, the two axes are
   * multiplied together again and the next tone costs five rules per variant.
   * Button.css is the reference.
   */
  [
    'tone rules set variables rather than painting',
    (() => {
      const PAINT = /^(background|background-color|color|box-shadow|border-color|fill|stroke)\s*:/
      const offenders = []
      for (const match of css.matchAll(/([^{}]*\[data-tone=[^{}]*)\{([^}]*)\}/g)) {
        const paints = match[2]
          .split(';')
          .map((decl) => decl.trim())
          .filter((decl) => PAINT.test(decl))
        if (paints.length) offenders.push(match[1].trim().slice(-48))
      }
      return (
        offenders.length === 0 ||
        (console.log(`\n       paints inside a tone rule: ${[...new Set(offenders)].join(', ')}`), false)
      )
    })(),
  ],
  /*
   * Class names are BEM: may-<block>__<element>--<modifier>.
   *
   * Not taste — the style runtime keys a component's sheet by its name, and a
   * class that does not carry its block is a class no one can find from the
   * component that owns it.
   */
  [
    'every class name is may-block__element--modifier',
    (() => {
      const shape = /^may-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$/
      const names = new Set(
        [...css.matchAll(/\.(may-[a-zA-Z0-9_-]+)/g)].map((match) => match[1]),
      )
      const offenders = [...names].filter((name) => !shape.test(name))
      return (
        offenders.length === 0 ||
        (console.log(`\n       not BEM: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  [
    'no component sizes an icon behind a :not([width]) guard',
    (() => {
      const offenders = sources()
        .filter((file) => /\/(components|desktop|mobile)\//.test(file))
        .map((file) => file.replace(/\.tsx?$/, '.css'))
        .filter((file) => existsSync(file))
        .filter((file) => /:not\(\[width\]\)/.test(readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')))
        .map((file) => file.split('/').pop())
      return (
        offenders.length === 0 ||
        (console.log(`\n       width-guarded icon rule in: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  [
    'a component that styles itself also forwards the rest',
    (() => {
      /*
       * MayHost is deliberately not exported, and the provider's `host` prop
       * takes MayHostConfig — a closed subset with no DOM props — so there is
       * no route by which a consumer could pass anything to forward.
       */
      const EXEMPT = new Set(['MayHost'])
      const offenders = sources()
        .filter((file) => /\/(components|desktop|mobile)\//.test(file))
        .filter((file) => {
          const name = file.split('/').pop().replace(/\.tsx?$/, '')
          if (EXEMPT.has(name)) return false
          const body = readFileSync(file, 'utf8')
          return body.includes('className') && !body.includes('...rest')
        })
        .map((file) => file.split('/').pop())
      return (
        offenders.length === 0 ||
        (console.log(`\n       takes className but forwards no rest: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  [
    'overlay dismissal goes through the shared layer stack',
    rogueKeydown.length === 0 ||
      (console.log(`\n       registers its own keydown: ${rogueKeydown.join(', ')}`), false),
  ],
  [
    'element resets cannot out-specify the components they paint over',
    overreachingResets.length === 0 ||
      (console.log(`\n       offending selector(s): ${overreachingResets.join(', ')}`), false),
  ],
  /*
   * A focus rule never inherits a radius.
   *
   * base.css had `border-radius: inherit` in `.may-root :focus-visible`,
   * meant for the ring. It applies to the FOCUSED ELEMENT, and at that
   * specificity it outranked the component's own radius — so tabbing to a
   * pill Button inside a square container set the button's radius to that
   * container's 0, and every capsule in the system squared off the moment a
   * keyboard user reached it. Measured in a browser: 9999px before focus,
   * 0px under a real Tab.
   *
   * Only keyboard users ever saw it. No gate reads a computed radius, axe
   * does not look at shape, and a screenshot of a mouse-driven page cannot
   * show it. `inherit` is the whole fault, so that is what this rejects — a
   * skip link revealing itself on focus sets an explicit radius, and should.
   */
  [
    'no focus rule inherits its border-radius',
    (() => {
      const offenders = []
      for (const match of css.matchAll(/([^{}]*)\{([^}]*)\}/g)) {
        const selectors = match[1].split(',').filter((one) => /:focus(-visible|-within)?\b/.test(one))
        if (!selectors.length) continue
        if (!/border-radius\s*:\s*inherit/.test(match[2])) continue
        offenders.push(selectors[0].trim().slice(-48))
      }
      return (
        offenders.length === 0 ||
        (console.log(`\n       focus rule inherits a radius: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  /*
   * The focus ring is never diluted.
   *
   * It was `color-mix(in srgb, var(--may-color-ring) 45%, transparent)`.
   * Composited over the surfaces it actually sits on — the outline is offset
   * 2px, so that is the page behind, not the control's own fill — the wash
   * measured 1.85:1 on white and 1.78:1 on the grouped background, against
   * the 3:1 a focus indicator is asked for. Alpha could not rescue it: 0.8
   * still read 2.83:1 on grouped, and the tint tops out at 4.02:1 white /
   * 3.60:1 grouped fully opaque. Solid is the only value with margin, in all
   * four surface/mode pairs (worst 3.60:1; dark reaches 4.66 and 5.76).
   *
   * axe cannot find this — it does not evaluate focus-state styles — and it
   * is invisible to anyone using a mouse, which is why a soft ring reads as
   * a tasteful choice right up until someone has to find it.
   */
  [
    'the focus ring is a solid colour, not a wash',
    (() => {
      /*
       * Keyed on the token, not the property: base.css and four controls drew
       * the ring with `outline`, and five text fields with a `box-shadow`
       * spread. Both were 28-45% washes, so checking one property would have
       * cleared half of them.
       */
      const offenders = []
      for (const match of css.matchAll(/([^{}]*)\{([^}]*)\}/g)) {
        const selectors = match[1].split(',').filter((one) => /:focus(-visible|-within)?\b/.test(one))
        if (!selectors.length) continue
        for (const declaration of match[2].split(';')) {
          if (!/\b(outline|box-shadow)\s*:/.test(declaration)) continue
          if (!/--may-color-(ring|danger)/.test(declaration)) continue
          if (!/color-mix|\btransparent\b|rgba?\(|\/\s*0?\.\d/.test(declaration)) continue
          offenders.push(`${selectors[0].trim().slice(-40)} {${declaration.trim().slice(0, 60)}}`)
        }
      }
      return (
        offenders.length === 0 ||
        (console.log(`\n       diluted focus ring: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  /*
   * The defaults key is the exported name.
   *
   * `components={{ Button: { size: 'lg' } }}` is looked up by the string a
   * barrel hands to `mayStyled`, and every component's defaults arrive through
   * that one call — there is no per-component wiring to get wrong. What there
   * is to get wrong is the string: a barrel that borrows another component's
   * sheet sits one careless copy away from registering under that component's
   * name, and then a consumer's defaults for it are silently never applied,
   * while the ones for its neighbour apply twice. Nothing about the rendering
   * would look wrong.
   *
   * Cheap to state and it only fires on a real mismatch.
   */
  [
    'every mayStyled name matches the name it is exported under',
    (() => {
      const pattern = /export const (\w+) = (?:\/\*#__PURE__\*\/ )?mayStyled\(\s*'([^']+)'/g
      const offenders = []
      let checked = 0
      for (const file of sources().filter((name) => name.endsWith('/index.ts'))) {
        for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
          checked++
          if (match[1] !== match[2]) offenders.push(`${match[1]} registered as '${match[2]}'`)
        }
      }
      if (!checked) {
        console.log('\n       matched no mayStyled export at all — the pattern has gone stale')
        return false
      }
      return (
        offenders.length === 0 ||
        (console.log(`\n       defaults key does not match the export: ${offenders.join(', ')}`), false)
      )
    })(),
  ],
  /*
   * The sliding thumb mirrors for RTL.
   *
   * The thumb is laid out at 1px, anchored with `inset-inline-start` and
   * SCALED to the width of the item it sits under. Under `dir="rtl"` that
   * anchor is the right edge, so both the scale origin and the sign of the
   * translate have to flip — and scaling a 1px box about the wrong edge moves
   * it by its whole width, not by a pixel. Measured before the fix, on a
   * document with dir="rtl": a CapsuleTabs thumb sat one chip clear of its
   * chip, and a Pagination thumb 331px away.
   *
   * Five controls share this hook, so the mirroring lives in it rather than
   * in five sheets. Only a browser can prove the geometry, so what is checked
   * here is that the direction is still consulted at all — deleting either
   * half would leave RTL silently wrong again, and no other gate reads this
   * file.
   */
  [
    'the sliding thumb still mirrors itself for RTL',
    (() => {
      const source = readFileSync(join(srcRoot, 'motion/sliding-thumb.ts'), 'utf8')
      const missing = []
      if (!/direction === 'rtl'/.test(source)) missing.push('no direction read')
      if (!/100% 50%/.test(source)) missing.push('no mirrored transform-origin')
      if (!/rtl \? -offset : offset/.test(source)) missing.push('translate sign is not flipped')
      if (!/t\.right - s\.right/.test(source)) missing.push('geometry is not measured from the right edge')
      return (
        missing.length === 0 ||
        (console.log(`\n       sliding-thumb.ts: ${missing.join(', ')}`), false)
      )
    })(),
  ],
  /*
   * The Slider mirrors in both halves, not just the visible one.
   *
   * Its fill is width plus `inset-inline-start`, so CSS reverses that on its
   * own. Two things did not follow. The knob pairs the same logical anchor
   * with a PHYSICAL `translate`, so under `dir="rtl"` it was pushed off the
   * end — measured at value 30, the knob sat at 127% of the track, outside it
   * entirely. And the pointer-to-value mapping read left-to-right, so a click
   * at the visually-high left end returned 9 out of 100 and threw the knob to
   * the far side.
   *
   * A browser is the only place the geometry can be proved, so what is
   * checked here is that both halves still consult direction at all.
   */
  [
    'the Slider mirrors its knob travel and its pointer mapping',
    (() => {
      const missing = []
      const styles = readFileSync(join(srcRoot, 'components/Slider/Slider.css'), 'utf8')
      if (!/\[dir=['"]?rtl['"]?\][^{]*\.may-slider__thumb[^{]*\{[^}]*translate[^}]*\* -1/s.test(styles)) {
        missing.push('no mirrored translate for the knob')
      }
      const source = readFileSync(join(srcRoot, 'components/Slider/Slider.tsx'), 'utf8')
      if (!/direction === 'rtl' \? 1 - t : t/.test(source)) {
        missing.push('the pointer mapping does not mirror')
      }
      return (
        missing.length === 0 || (console.log(`\n       Slider: ${missing.join(', ')}`), false)
      )
    })(),
  ],
]

let bad = 0
console.log('design contract\n')
for (const [label, ok] of checks) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) bad++
}
process.exit(bad ? 1 : 0)
