/**
 * The sliding selection thumb — the single most recognisable piece of iOS
 * motion, and the one both reference projects get wrong by cross-fading their
 * indicator between segments instead of moving it.
 *
 * Drives SegmentedControl, CapsuleTabs and the TabBar indicator.
 *
 * Constants here are measured, not guessed:
 *   SETTLE_MS 220   — quick enough to answer selection immediately while the
 *                     curve still carries a physical arrival.
 *   FOLLOW_MS 90    — while a finger is down the thumb tracks it almost
 *                     exactly; any easing here reads as lag.
 *   PRESS_SCALE     — non-uniform on purpose. Puffing 1.1x more vertically
 *                     than horizontally reads as the thumb lifting off the
 *                     track rather than simply getting bigger.
 */

export const SETTLE_MS = 220
export const SETTLE_EASE = 'cubic-bezier(.32,.72,0,1)'
export const FOLLOW_MS = 90
/** Decoration clock for consumers that animate independently of the thumb. */
export const TINT_MS = 220
export const PRESS_SCALE_X = 1.16
export const PRESS_SCALE_Y = PRESS_SCALE_X * 1.1

/**
 * Which way the thumb slides. `inline` is left-to-right (every consumer so far);
 * `block` is top-to-bottom, for a vertical tab strip or a vertical stepper.
 */
export type ThumbAxis = 'inline' | 'block'

export interface ThumbGeometry {
  /** Offset from the track's leading edge along the axis, in px. */
  x: number
  /** Extent along the axis, in px. */
  width: number
}

/**
 * Measure where the thumb should sit for a given segment.
 *
 * `x`/`width` are named for the inline case but mean "along the axis": on the
 * block axis they carry the top offset and the height. Naming them once, rather
 * than a second `{ y, height }` shape, is what lets one `applyThumb` drive both
 * — the vertical mirror used to live forked inside Tabs.
 */
export function geometryFor(
  track: HTMLElement,
  segment: HTMLElement,
  axis: ThumbAxis = 'inline',
  /** The track's rect when the caller has already measured it. Reading it a
   *  second time for the same placement is a wasted layout query. */
  trackRect?: DOMRect,
): ThumbGeometry {
  const t = trackRect ?? track.getBoundingClientRect()
  const s = segment.getBoundingClientRect()
  return axis === 'block'
    ? { x: s.top - t.top, width: s.height }
    : { x: s.left - t.left, width: s.width }
}

export interface ApplyOptions {
  /** Which axis the thumb translates and stretches on. @default 'inline' */
  axis?: ThumbAxis
  /**
   * How far past the end of the track the thumb is being pulled, in px, already
   * rubber-banded by the caller. Positive is trailing, negative is leading.
   */
  overdrag?: number
  /** How long the settle takes. A control can be quicker than the default. */
  settleMs?: number
  /**
   * The curve the thumb settles on when it is not following a pointer. Defaults
   * to the iOS presentation curve that Tabs and CapsuleTabs use; a control can
   * name its own, and a `var()` resolves against the thumb like any other
   * inline value.
   */
  easing?: string
  /**
   * No transition at all: the thumb IS where the pointer is, this frame. Used
   * once it has caught up, when any easing at all reads as lag rather than as
   * weight.
   */
  instant?: boolean
  /**
   * How much the thumb puffs while held. The default suits a thumb with room
   * around it; a control whose track hugs its thumb wants far less, or the puff
   * spills past the track it is supposed to be sitting in.
   */
  pressScale?: number
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
  {
    axis = 'inline',
    following = false,
    pressed = false,
    reducedMotion = false,
    overdrag = 0,
    instant = false,
    easing = SETTLE_EASE,
    settleMs = SETTLE_MS,
    pressScale = PRESS_SCALE_X,
  }: ApplyOptions = {},
): void {
  // The along-axis stretch, and the cross-axis puff. On the inline axis the
  // along-axis scale is scaleX and the puff is scaleY; on the block axis they
  // swap. The puff is non-uniform on purpose: 1.1x more across the track than
  // along it reads as the thumb lifting off rather than simply getting bigger.
  const along = pressed ? pressScale : 1
  const cross = pressed ? 1 + (pressScale - 1) * 1.1 : 1

  const d = reducedMotion ? 1 : settleMs
  const transition = instant
    ? 'transform 0s'
    : following
      ? `transform ${reducedMotion ? 1 : FOLLOW_MS}ms linear`
      : `transform ${d}ms ${easing}`

  /*
   * Scaled about its own CENTRE, which takes an offset: the thumb is laid out
   * at 1px and its origin is the leading edge, so scaling grows it in one
   * direction only. Pulling the position back by half the growth puts the
   * middle where it would have been, instead of letting a held thumb drift
   * toward the track's leading edge.
   */
  const centred = x - (width * (along - 1)) / 2
  const offset = centred + overdrag

  const transform =
    axis === 'block'
      ? `translateY(${offset}px) scaleY(${width * along}) scaleX(${cross})`
      : `translateX(${offset}px) scaleX(${width * along}) scaleY(${cross})`

  /*
   * Write only what actually changed. A style write is not free even when the
   * value is identical — re-stating `transition` mid-transition disturbs it,
   * and a follow re-composes the same string on every frame. The shorthand
   * cannot be read back to compare (a `var()` in any longhand serialises the
   * shorthand as empty), so the last write is remembered here instead.
   */
  let last = written.get(thumb)
  if (!last) {
    // Individual properties left by an earlier version would win over the
    // shorthand. Clearing them on the first write is enough: nothing else
    // sets them afterwards.
    thumb.style.translate = ''
    thumb.style.scale = ''
    last = { transition: '', transform: '' }
    written.set(thumb, last)
  }
  if (last.transition !== transition) {
    last.transition = transition
    thumb.style.transition = transition
  }
  if (last.transform !== transform) {
    last.transform = transform
    thumb.style.transform = transform
  }
}

/** The last transition/transform written to each thumb. See `applyThumb`. */
const written = new WeakMap<HTMLElement, { transition: string; transform: string }>()

/**
 * Which segment a pointer at `client` (clientX on the inline axis, clientY on
 * the block axis) is over. Returns -1 outside the track. Used so dragging across
 * a control selects as you go, the way iOS does, instead of only on release.
 */
export function segmentAt(
  segments: HTMLElement[],
  client: number,
  axis: ThumbAxis = 'inline',
): number {
  for (let i = 0; i < segments.length; i++) {
    const r = segments[i]!.getBoundingClientRect()
    const lead = axis === 'block' ? r.top : r.left
    const trail = axis === 'block' ? r.bottom : r.right
    if (client >= lead && client <= trail) return i
  }
  return -1
}
