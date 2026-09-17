import * as Adaptive from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'
import * as Examples from '../dist/examples.js'

export const builtStyleEntries = {
  'mayui.js': Adaptive,
  'desktop.js': Desktop,
  'mobile.js': Mobile,
  'examples.js': Examples,
}

export function styleSheetsFor(module) {
  const sheets = new Map()
  for (const value of Object.values(module)) {
    for (const sheet of value?.__mayStyles ?? []) sheets.set(sheet.href, sheet)
  }
  return [...sheets.values()]
}

export const builtStyleSheets = (() => {
  const sheets = new Map()
  for (const module of Object.values(builtStyleEntries)) {
    for (const sheet of styleSheetsFor(module)) sheets.set(sheet.href, sheet)
  }
  return [...sheets.values()]
})()

export const builtCss = builtStyleSheets.map((sheet) => sheet.css).join('\n')

/*
 * Refuse to hand back an empty stylesheet.
 *
 * Three gates read `builtCss`, and most of what they assert is of the form
 * "no rule does X" — which is true of no rules at all. The sheets are
 * collected from a NON-ENUMERABLE `__mayStyles` property, so a refactor of
 * `mayStyled` that stopped defining it, or a bundler that dropped it, empties
 * this string and takes the CSS half of check:contract silently with it.
 * Measured: with the collection stubbed out, the focus-ring, focus-radius,
 * BEM, tone and hover assertions all printed `ok` against zero bytes.
 *
 * The floor is deliberately far below the real figure — 81 sheets and ~250k
 * characters today — so it catches a collapse, not a diet.
 */
const FLOOR_SHEETS = 40
const FLOOR_CHARS = 50_000
if (builtStyleSheets.length < FLOOR_SHEETS || !builtCss.includes('@layer may-ui')) {
  throw new Error(
    `built-styles collected ${builtStyleSheets.length} sheet(s) and ${builtCss.length} characters, ` +
      `expected at least ${FLOOR_SHEETS} sheets carrying @layer may-ui. ` +
      'Every CSS assertion downstream is vacuous until this is fixed — check that ' +
      'mayStyled still defines __mayStyles and that the build is current.',
  )
}
if (builtCss.length < FLOOR_CHARS) {
  throw new Error(
    `built-styles collected only ${builtCss.length} characters of CSS, expected at least ${FLOOR_CHARS}.`,
  )
}
