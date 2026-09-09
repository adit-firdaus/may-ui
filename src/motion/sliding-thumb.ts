/**
 * The sliding selection thumb — the single most recognisable piece of iOS
 * motion, and the one both reference projects get wrong by cross-fading their
 * indicator between segments instead of moving it.
 *
 * Drives SegmentedControl, CapsuleTabs and the TabBar indicator.
 *
 * Constants here are measured, not guessed:
 *   SETTLE_MS 340   — 200ms is too abrupt to read as physical; past ~500ms it
 *                     starts to feel heavy rather than lively.
 *   FOLLOW_MS 90    — while a finger is down the thumb tracks it almost
 *                     exactly; any easing here reads as lag.
 *   PRESS_SCALE     — non-uniform on purpose. Puffing 1.1x more vertically
 *                     than horizontally reads as the thumb lifting off the
 *                     track rather than simply getting bigger.
 */

export const SETTLE_MS = 340
export const SETTLE_EASE = 'cubic-bezier(.32,.72,0,1)'
export const FOLLOW_MS = 90
export const PRESS_SCALE_X = 1.16
export const PRESS_SCALE_Y = PRESS_SCALE_X * 1.1

export interface ThumbGeometry {
  /** Offset from the track's leading edge, in px. */
  x: number
  width: number
}

/** Measure where the thumb should sit for a given segment. */
export function geometryFor(track: HTMLElement, segment: HTMLElement): ThumbGeometry {
  const t = track.getBoundingClientRect()
  const s = segment.getBoundingClientRect()
  return { x: s.left - t.left, width: s.width }
}

export interface ApplyOptions {
  /** True while a finger or pointer is down — the thumb follows instead of settling. */
  following?: boolean
  /** True while the thumb is being held, which puffs it up. */
  pressed?: boolean
  reducedMotion?: boolean
}

/**
 * Position the thumb. Transform-only, so it stays on the compositor: the
 * element is laid out once at width 1px and scaled, rather than animating
 * `left`/`width` and forcing layout on every frame.
 */
export function applyThumb(
  thumb: HTMLElement,
  { x, width }: ThumbGeometry,
  { following = false, pressed = false, reducedMotion = false }: ApplyOptions = {},
): void {
  const sx = pressed ? PRESS_SCALE_X : 1
  const sy = pressed ? PRESS_SCALE_Y : 1

  thumb.style.transition = reducedMotion
    ? 'transform 1ms linear'
    : following
      ? `transform ${FOLLOW_MS}ms linear`
      : `transform ${SETTLE_MS}ms ${SETTLE_EASE}`

  // translate first, then scale about the centre, so a puffed thumb grows
  // symmetrically rather than drifting toward the track's leading edge.
  thumb.style.transform = `translateX(${x}px) scaleX(${width * sx}) scaleY(${sy})`
}

/**
 * Which segment a pointer at `clientX` is over. Returns -1 outside the track.
 * Used so dragging across a segmented control selects as you go, the way iOS
 * does, instead of only on release.
 */
export function segmentAt(segments: HTMLElement[], clientX: number): number {
  for (let i = 0; i < segments.length; i++) {
    const r = segments[i]!.getBoundingClientRect()
    if (clientX >= r.left && clientX <= r.right) return i
  }
  return -1
}
