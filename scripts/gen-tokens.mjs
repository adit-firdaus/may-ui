/**
 * Composes src/styles/tokens.css.
 *
 * The dark palette is written ONCE here and emitted into both
 * [data-may-theme='dark'] and the prefers-color-scheme mirror, so the explicit
 * toggle and the OS setting can never disagree.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/* Apple's system palette, both appearances. */
const light = {
  '-- Backgrounds': null,
  'bg-grouped': '#f2f2f7',
  'bg-elevated': '#ffffff',
  'bg-nested': '#f2f2f7',
  'bg-base': '#ffffff',
  '-- Labels': null,
  label: '#000000',
  'label-secondary': 'rgba(60, 60, 67, 0.6)',
  'label-tertiary': 'rgba(60, 60, 67, 0.3)',
  'label-quaternary': 'rgba(60, 60, 67, 0.18)',
  '-- Fills. These replace borders on every control.': null,
  'fill-primary': 'rgba(120, 120, 128, 0.2)',
  'fill-secondary': 'rgba(120, 120, 128, 0.16)',
  'fill-tertiary': 'rgba(118, 118, 128, 0.12)',
  'fill-quaternary': 'rgba(116, 116, 128, 0.08)',
  '-- Separators': null,
  separator: 'rgba(60, 60, 67, 0.29)',
  'separator-opaque': '#c6c6c8',
  '-- System colours': null,
  blue: '#007aff',
  green: '#34c759',
  indigo: '#5856d6',
  orange: '#ff9500',
  pink: '#ff2d55',
  purple: '#af52de',
  red: '#ff3b30',
  teal: '#30b0c7',
  yellow: '#ffcc00',
  mint: '#00c7be',
  cyan: '#32ade6',
  brown: '#a2845e',
  '-- Gray ramp': null,
  gray: '#8e8e93',
  'gray-2': '#aeaeb2',
  'gray-3': '#c7c7cc',
  'gray-4': '#d1d1d6',
  'gray-5': '#e5e5ea',
  'gray-6': '#f2f2f7',
  '-- Overlay + chrome': null,
  scrim: 'rgba(0, 0, 0, 0.4)',
  'scrollbar-thumb': 'rgba(60, 60, 67, 0.28)',
  'scrollbar-thumb-hover': 'rgba(60, 60, 67, 0.42)',
  'on-color': '#ffffff',
  'shadow-color': '0, 0, 0',
  'shadow-a1': '0.03',
  'shadow-a2': '0.04',
  'shadow-a3': '0.06',
  'shadow-a4': '0.08',
  'shadow-a5': '0.12',
  'shadow-a6': '0.16',
  'shadow-a7': '0.2',
}

const dark = {
  '-- Backgrounds': null,
  'bg-grouped': '#000000',
  'bg-elevated': '#1c1c1e',
  'bg-nested': '#2c2c2e',
  'bg-base': '#000000',
  '-- Labels': null,
  label: '#ffffff',
  'label-secondary': 'rgba(235, 235, 245, 0.6)',
  'label-tertiary': 'rgba(235, 235, 245, 0.3)',
  'label-quaternary': 'rgba(235, 235, 245, 0.16)',
  '-- Fills': null,
  'fill-primary': 'rgba(120, 120, 128, 0.36)',
  'fill-secondary': 'rgba(120, 120, 128, 0.32)',
  'fill-tertiary': 'rgba(118, 118, 128, 0.24)',
  'fill-quaternary': 'rgba(116, 116, 128, 0.18)',
  '-- Separators': null,
  separator: 'rgba(84, 84, 88, 0.6)',
  'separator-opaque': '#38383a',
  '-- System colours': null,
  blue: '#0a84ff',
  green: '#30d158',
  indigo: '#5e5ce6',
  orange: '#ff9f0a',
  pink: '#ff375f',
  purple: '#bf5af2',
  red: '#ff453a',
  teal: '#40c8e0',
  yellow: '#ffd60a',
  mint: '#63e6e2',
  cyan: '#64d2ff',
  brown: '#ac8e68',
  '-- Gray ramp': null,
  gray: '#8e8e93',
  'gray-2': '#636366',
  'gray-3': '#48484a',
  'gray-4': '#3a3a3c',
  'gray-5': '#2c2c2e',
  'gray-6': '#1c1c1e',
  '-- Overlay + chrome': null,
  scrim: 'rgba(0, 0, 0, 0.55)',
  'scrollbar-thumb': 'rgba(235, 235, 245, 0.28)',
  'scrollbar-thumb-hover': 'rgba(235, 235, 245, 0.42)',
  'on-color': '#ffffff',
  'shadow-color': '0, 0, 0',
  'shadow-a1': '0.2',
  'shadow-a2': '0.24',
  'shadow-a3': '0.32',
  'shadow-a4': '0.4',
  'shadow-a5': '0.48',
  'shadow-a6': '0.56',
  'shadow-a7': '0.64',
}

const emit = (map, indent) =>
  Object.entries(map)
    .map(([k, v]) =>
      v === null ? `${indent}/*${k.slice(2)} */` : `${indent}--may-${k}: ${v};`,
    )
    .join('\n')

const themed = "  /* ---------------------------------------------------------------- *\n   * Semantic colour and elevation — the tier components consume.\n   *\n   * Declared in EVERY theme scope on purpose. These are aliases, and an alias\n   * is substituted where it is declared: if they lived only on :root they\n   * would resolve against the light primitives and a scoped dark subtree\n   * would inherit light values while its own primitives sat unused.\n   * ---------------------------------------------------------------- */\n\n  --may-color-bg: var(--may-bg-grouped);\n  --may-color-surface: var(--may-bg-elevated);\n  --may-color-surface-nested: var(--may-bg-nested);\n\n  --may-color-text: var(--may-label);\n  --may-color-text-secondary: var(--may-label-secondary);\n  --may-color-text-tertiary: var(--may-label-tertiary);\n  --may-color-text-quaternary: var(--may-label-quaternary);\n\n  --may-color-fill: var(--may-fill-primary);\n  --may-color-fill-secondary: var(--may-fill-secondary);\n  --may-color-fill-tertiary: var(--may-fill-tertiary);\n  --may-color-fill-quaternary: var(--may-fill-quaternary);\n\n  --may-color-separator: var(--may-separator);\n  --may-color-separator-opaque: var(--may-separator-opaque);\n\n  /* Brand as text vs brand as fill — see the header note. */\n  --may-color-tint: var(--may-blue);\n  --may-color-primary: var(--may-blue);\n  --may-color-on-primary: var(--may-on-color);\n\n  /* Destructive, likewise split. */\n  --may-color-danger: var(--may-red);\n  --may-color-destructive: var(--may-red);\n  --may-color-on-destructive: var(--may-on-color);\n\n  --may-color-success: var(--may-green);\n  --may-color-warning: var(--may-orange);\n  --may-color-info: var(--may-blue);\n\n  /* One highlight rule for every selectable row in the system. */\n  --may-color-highlight: var(--may-fill-quaternary);\n  --may-color-highlight-strong: var(--may-fill-tertiary);\n\n  --may-color-scrim: var(--may-scrim);\n  --may-color-ring: var(--may-color-tint);\n\n  /* Elevation. No hairline rings: surfaces separate by value, and only\n   * genuinely floating layers cast a shadow at all. The dark scope redefines\n   * every alpha, so these must re-resolve with it. */\n  --may-shadow-2xs: 0 1px 1px 0 rgba(var(--may-shadow-color), var(--may-shadow-a1));\n  --may-shadow-xs: 0 1px 2px 0 rgba(var(--may-shadow-color), var(--may-shadow-a2));\n  --may-shadow-sm: 0 1px 2px 0 rgba(var(--may-shadow-color), var(--may-shadow-a2));\n  --may-shadow: 0 2px 6px -1px rgba(var(--may-shadow-color), var(--may-shadow-a3));\n  --may-shadow-md: 0 4px 12px -2px rgba(var(--may-shadow-color), var(--may-shadow-a4));\n  --may-shadow-lg: 0 12px 32px -6px rgba(var(--may-shadow-color), var(--may-shadow-a5));\n  --may-shadow-xl: 0 20px 48px -10px rgba(var(--may-shadow-color), var(--may-shadow-a6));\n  --may-shadow-2xl: 0 28px 64px -14px rgba(var(--may-shadow-color), var(--may-shadow-a7));"

const css = `/**
 * GENERATED by scripts/gen-tokens.mjs — do not edit.
 *
 * May UI's token layer. Two tiers:
 *   1. Primitives  --may-<name>        Apple's own system values
 *   2. Semantic    --may-color-<role>  what components actually consume
 *
 * Restyle the whole system by overriding the semantic tier alone.
 *
 * Note the pair that ports usually collapse into one: --may-color-tint is the
 * brand as TEXT on a neutral surface (links, plain buttons, active tab labels);
 * --may-color-primary is the brand as a FILL carrying white text. They are the
 * same hue doing different jobs, and merging them is why ported Apple systems
 * look subtly wrong.
 */

:root {
  color-scheme: light;

${emit(light, '  ')}

${themed}
}

/* Explicit opt-in. */
[data-may-theme='dark'] {
  color-scheme: dark;

${emit(dark, '  ')}

${themed}
}

/*
 * Explicit opt-in, the other way.
 *
 * This scope has to exist for the same reason the dark one does, and its
 * absence was a real bug: MayProvider stamps data-may-theme on its own div, not
 * on the document element, so on a dark OS the media query below matches :root
 * (which never carries the attribute) and hands the whole page dark tokens. A
 * div asking for light then had nothing to restore them with, and light mode
 * simply could not be pinned. Re-declaring the full palette here is what makes
 * the toggle work in both directions.
 */
[data-may-theme='light'] {
  color-scheme: light;

${emit(light, '  ')}

${themed}
}

/* The OS setting, unless a light theme is pinned. */
@media (prefers-color-scheme: dark) {
  :root:not([data-may-theme='light']) {
    color-scheme: dark;

${emit(dark, '    ')}

${themed.split(String.fromCharCode(10)).map(l => l ? '  ' + l : l).join(String.fromCharCode(10))}
  }
}

:root {
  /* ---------------------------------------------------------------- *
   * Control height is a single knob; every rung is a proportion of it
   * ---------------------------------------------------------------- */

  --may-control-h: 2.75rem;                        /* 44px — Apple's touch target */
  --may-control-h-xs: calc(var(--may-control-h) - 0.75rem);
  --may-control-h-sm: calc(var(--may-control-h) - 0.5rem);
  --may-control-h-md: var(--may-control-h);
  --may-control-h-lg: calc(var(--may-control-h) + 0.5rem);

  /* Radius derives from element scale, not per-file taste. */
  --may-radius-xs: 6px;
  --may-radius-sm: 8px;
  --may-radius-md: 10px;
  --may-radius-lg: 12px;
  --may-radius-card: 16px;
  --may-radius-sheet: 20px;
  --may-radius-full: 9999px;
  --may-radius-squircle: 22%;                      /* iOS app-icon approximation */

  /* ---------------------------------------------------------------- *
   * Spacing — 4px base
   * ---------------------------------------------------------------- */

  --may-space-0: 0;
  --may-space-1: 0.25rem;
  --may-space-2: 0.5rem;
  --may-space-3: 0.75rem;
  --may-space-4: 1rem;
  --may-space-5: 1.25rem;
  --may-space-6: 1.5rem;
  --may-space-8: 2rem;
  --may-space-10: 2.5rem;
  --may-space-12: 3rem;
  --may-space-16: 4rem;
  --may-space-20: 5rem;
  --may-space-24: 6rem;

  /* ---------------------------------------------------------------- *
   * Typography — Apple's named text styles.
   * Each token carries size, leading, tracking and weight, because in iOS
   * those four move together. body and headline are deliberately the SAME
   * size, differing only in weight and tracking.
   * ---------------------------------------------------------------- */

  --may-font-sans: -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --may-font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  --may-font-rounded: ui-rounded, var(--may-font-sans);

  --may-text-caption-2: 0.6875rem;
  --may-text-caption-2-leading: 0.8125rem;
  --may-text-caption-2-tracking: 0.006em;
  --may-text-caption-2-weight: 400;

  --may-text-caption-1: 0.75rem;
  --may-text-caption-1-leading: 1rem;
  --may-text-caption-1-tracking: 0.005em;
  --may-text-caption-1-weight: 400;

  --may-text-footnote: 0.8125rem;
  --may-text-footnote-leading: 1.125rem;
  --may-text-footnote-tracking: 0em;
  --may-text-footnote-weight: 400;

  --may-text-subheadline: 0.9375rem;
  --may-text-subheadline-leading: 1.25rem;
  --may-text-subheadline-tracking: 0em;
  --may-text-subheadline-weight: 400;

  --may-text-callout: 1rem;
  --may-text-callout-leading: 1.3125rem;
  --may-text-callout-tracking: 0em;
  --may-text-callout-weight: 400;

  --may-text-body: 1.0625rem;
  --may-text-body-leading: 1.375rem;
  --may-text-body-tracking: -0.002em;
  --may-text-body-weight: 400;

  --may-text-headline: 1.0625rem;
  --may-text-headline-leading: 1.375rem;
  --may-text-headline-tracking: -0.006em;
  --may-text-headline-weight: 600;

  --may-text-title-3: 1.25rem;
  --may-text-title-3-leading: 1.5625rem;
  --may-text-title-3-tracking: -0.01em;
  --may-text-title-3-weight: 600;

  --may-text-title-2: 1.375rem;
  --may-text-title-2-leading: 1.75rem;
  --may-text-title-2-tracking: -0.012em;
  --may-text-title-2-weight: 700;

  --may-text-title-1: 1.75rem;
  --may-text-title-1-leading: 2.125rem;
  --may-text-title-1-tracking: -0.016em;
  --may-text-title-1-weight: 700;

  --may-text-large-title: 2.125rem;
  --may-text-large-title-leading: 2.5625rem;
  --may-text-large-title-tracking: -0.02em;
  --may-text-large-title-weight: 700;

  /* ---------------------------------------------------------------- *
   * Layering, layout, chrome
   * ---------------------------------------------------------------- */

  --may-z-base: 1;
  --may-z-sticky: 100;
  --may-z-nav: 200;
  --may-z-overlay: 1000;
  --may-z-sheet: 1100;
  --may-z-popover: 1200;
  --may-z-toast: 1300;
  --may-z-tooltip: 1400;

  /* Defined ONCE. The useIsDesktop hook reads this same value, so JS and CSS
   * can never disagree about what "desktop" means. */
  --may-breakpoint-desktop: 1024px;

  --may-hairline: 0.5px;
  --may-scrollbar-size: 8px;
  /* Width of a list row's leading element. The hairline between two rows is
   * inset past it, the way iOS starts a separator under the label rather than
   * at the card edge. Defaults to a small IconTile; override per list when the
   * leading element is an Avatar or a Checkbox instead. */
  --may-list-leading-w: 29px;

  --may-tabbar-h: 3.25rem;
  --may-navbar-h: 2.75rem;

  --may-inset-top: env(safe-area-inset-top, 0px);
  --may-inset-bottom: env(safe-area-inset-bottom, 0px);
  --may-inset-left: env(safe-area-inset-left, 0px);
  --may-inset-right: env(safe-area-inset-right, 0px);

  /* How much of the layout viewport the on-screen keyboard is covering. Zero
     until something measures it: Android resizes the layout viewport when the
     keyboard opens, but iOS does NOT — it draws the keys over a viewport that
     stays full height, so a sheet's footer ends up underneath them with no way
     to reach it. useKeyboardInset writes the measured overlap here. */
  --may-keyboard-inset: 0px;

  /* The room the floating bars occupy, for a scroller to pad itself with. Both
   * bars overlay their content rather than sitting in flow, so the space they
   * take is not something layout can work out on its own. Constants rather than
   * measurements: they resolve before the first frame, need no JavaScript, and
   * exist whether or not a bar is on screen -- a view with no tab bar simply
   * never mentions --may-tab-bar-space. */
  /* How much of a stack's own gap a dismissing Alert takes with it. Declared
   * here at zero so a lone alert behaves exactly as it always did; a stack sets
   * it on the container, and an override on a nearer ancestor beats this. */
  --may-alert-gap: 0px;

  --may-nav-bar-space: calc(var(--may-navbar-h) + var(--may-inset-top));
  --may-tab-bar-space: calc(
    var(--may-tabbar-h) + var(--may-inset-bottom) + var(--may-space-4) * 2
  );

  /* iOS app-icon gradients, for IconTile. */
  --may-grad-blue: linear-gradient(180deg, #64b5ff 0%, #007aff 52%, #005ecb 100%);
  --may-grad-green: linear-gradient(180deg, #5fe07a 0%, #34c759 52%, #28a745 100%);
  --may-grad-red: linear-gradient(180deg, #ff6b63 0%, #ff3b30 52%, #d92b20 100%);
  --may-grad-orange: linear-gradient(180deg, #ffb340 0%, #ff9500 52%, #d97e00 100%);
  --may-grad-yellow: linear-gradient(180deg, #ffe066 0%, #ffcc00 52%, #d9ad00 100%);
  --may-grad-purple: linear-gradient(180deg, #cd8ae8 0%, #af52de 52%, #9040ba 100%);
  --may-grad-pink: linear-gradient(180deg, #ff6b8a 0%, #ff2d55 52%, #d92546 100%);
  --may-grad-teal: linear-gradient(180deg, #6fd0e0 0%, #30b0c7 52%, #2894a8 100%);
  --may-grad-indigo: linear-gradient(180deg, #8b8ae8 0%, #5856d6 52%, #4442b5 100%);
  --may-grad-gray: linear-gradient(180deg, #b8b8bd 0%, #8e8e93 52%, #6d6d72 100%);
  --may-grad-spectrum: linear-gradient(135deg, #ff2d55 0%, #ff9500 28%, #ffcc00 52%, #34c759 72%, #007aff 100%);
}
`

writeFileSync(resolve(here, '../src/styles/tokens.css'), css)
console.log(`wrote src/styles/tokens.css (${css.length} bytes)`)

const blockAt = (source, start) => {
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  throw new Error(`unterminated CSS block at ${start}`)
}

const declarations = (source) =>
  Object.fromEntries(
    [...source.matchAll(/--may-([\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim().replace(/\s+/g, ' '),
    ]),
  )

const rootStarts = [...css.matchAll(/:root\s*\{/g)].map((match) => match.index)
const common = Object.assign({}, ...rootStarts.map((start) => declarations(blockAt(css, start))))
const darkStart = css.indexOf("[data-may-theme='dark']")
const darkValues = declarations(blockAt(css, darkStart))
const lightValues = { ...common }
const resolvedDarkValues = { ...common, ...darkValues }
const names = Object.keys(lightValues).sort()
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())

const tokenType = names.map((name) => `  readonly ${camel(name)}: MayTokenValue`).join('\n')
const cssNames = names.map((name) => `  ${camel(name)}: '${name}',`).join('\n')
const values = (map) =>
  names.map((name) => `  ${camel(name)}: ${JSON.stringify(map[name])},`).join('\n')

const generated = `/**
 * GENERATED by scripts/gen-tokens.mjs — do not edit.
 * Typed public token names and the two resolved default appearances.
 */

export type MayTokenValue = string | number

export interface MayTokens {
${tokenType}
}

export const mayTokenCssNames = {
${cssNames}
} as const satisfies Record<keyof MayTokens, string>

export const mayLightTokens = {
${values(lightValues)}
} as const satisfies Readonly<MayTokens>

export const mayDarkTokens = {
${values(resolvedDarkValues)}
} as const satisfies Readonly<MayTokens>
`

writeFileSync(resolve(here, '../src/styles/tokens.generated.ts'), generated)
console.log(`wrote src/styles/tokens.generated.ts (${generated.length} bytes)`)
