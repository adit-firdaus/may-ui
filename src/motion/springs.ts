/**
 * The runtime half of the motion system.
 *
 * The curves themselves live in CSS (src/styles/motion.css, generated from
 * real spring physics by scripts/gen-springs.mjs) so they run on the
 * compositor with no JavaScript on the animation frame. What is here is the
 * vocabulary: names, durations, and the helpers that hand a curve to WAAPI.
 */

export type SpringName = 'snappy' | 'smooth' | 'bouncy' | 'playful'
export type EaseName = 'back' | 'elastic' | 'bounce' | 'expo' | 'sheet' | 'standard' | 'out'

/** `var()` reference to a generated spring curve. */
export const spring = (name: SpringName) => `var(--may-spring-${name})`

/** `var()` reference to a named easing curve. */
export const ease = (name: EaseName) => `var(--may-ease-${name})`

/**
 * Durations, in ms. Named for intent rather than length.
 *
 * `settle` is 340 because the reference implementation measured it: 200ms is
 * too abrupt to read as physical, and past roughly 500ms the motion starts to
 * feel heavy rather than lively.
 */
export const duration = {
  instant: 80,
  fast: 150,
  settle: 340,
  sheetIn: 500,
  sheetOut: 300,
  follow: 90,
} as const

/** Resolve a curve token to its computed value, for WAAPI (which needs a real string). */
export function resolveCurve(el: Element, token: string): string {
  const name = token.match(/var\((--[\w-]+)\)/)?.[1]
  if (!name) return token
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  return value || 'ease-out'
}
