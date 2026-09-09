/**
 * FLIP — First, Last, Invert, Play.
 *
 * Animate a layout change that the browser has already committed, by measuring
 * before and after, applying the inverse as a transform, then releasing it.
 * This is what a layout-animation library sells; it is about thirty lines.
 */

import { resolveCurve } from './springs'

export interface FlipOptions {
  duration?: number
  /** A curve token such as `var(--may-spring-bouncy)`. */
  easing?: string
  onFinish?: () => void
}

export type FlipSnapshot = Map<Element, DOMRect>

/** FIRST — record where everything is now. */
export function snapshot(elements: Iterable<Element>): FlipSnapshot {
  const map: FlipSnapshot = new Map()
  for (const el of elements) map.set(el, el.getBoundingClientRect())
  return map
}

/**
 * LAST + INVERT + PLAY — call after the DOM has changed. Elements absent from
 * the snapshot are new, and are faded in rather than moved from nowhere.
 */
export function play(
  elements: Iterable<Element>,
  first: FlipSnapshot,
  { duration = 340, easing = 'var(--may-spring-smooth)', onFinish }: FlipOptions = {},
): Animation[] {
  const animations: Animation[] = []

  for (const el of elements) {
    const before = first.get(el)
    const after = el.getBoundingClientRect()
    const curve = resolveCurve(el, easing)

    if (!before) {
      animations.push(
        el.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
          duration,
          easing: curve,
          fill: 'none',
        }),
      )
      continue
    }

    const dx = before.left - after.left
    const dy = before.top - after.top
    const sx = before.width / after.width || 1
    const sy = before.height / after.height || 1

    // Sub-pixel deltas are noise; animating them costs a composite for nothing.
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
      continue
    }

    animations.push(
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transform: 'none' },
        ],
        { duration, easing: curve, fill: 'none' },
      ),
    )
  }

  if (onFinish && animations.length) {
    Promise.allSettled(animations.map((a) => a.finished)).then(onFinish)
  }

  return animations
}
