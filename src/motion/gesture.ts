/**
 * Pointer-drag primitives.
 *
 * This is the part CSS genuinely cannot do: tracking a finger, measuring how
 * fast it was moving when it left, and resisting past the end of the track.
 * Everything else in May UI is a CSS transition.
 */

import { easeOutCubic } from 'easing-utils'

/** Distance past the end at which resistance approaches its asymptote. */
export const RUBBER_MAX = 56

/**
 * Asymptotic rubber band. The further past the end you pull, the less the
 * surface gives — it never stops moving, and it never runs away.
 *
 *   rubber(0)   === 0
 *   rubber(56)  === 28
 *   rubber(1e6) →   56
 */
export function rubber(overshoot: number, max = RUBBER_MAX): number {
  const sign = Math.sign(overshoot)
  const over = Math.abs(overshoot)
  return (sign * (over * max)) / (over + max)
}

/** Clamp to a range, applying rubber-band resistance outside it. */
export function clampWithRubber(value: number, min: number, max: number): number {
  if (value < min) return min + rubber(value - min)
  if (value > max) return max + rubber(value - max)
  return value
}

export interface DragSample {
  x: number
  y: number
  t: number
}

/**
 * Velocity in px/ms, measured over a short trailing window rather than the
 * last two events — a single jittery final sample otherwise dominates, and
 * flicks read as either dead or impossibly fast.
 */
export function velocityFrom(samples: DragSample[], axis: 'x' | 'y', windowMs = 100): number {
  if (samples.length < 2) return 0
  const last = samples[samples.length - 1]!
  let first = samples[0]!
  for (let i = samples.length - 1; i >= 0; i--) {
    if (last.t - samples[i]!.t > windowMs) break
    first = samples[i]!
  }
  const dt = last.t - first.t
  if (dt <= 0) return 0
  return (last[axis] - first[axis]) / dt
}

/**
 * How far a flick would carry, given a velocity and how quickly it decays.
 * Used to decide whether a drag should complete or spring back.
 */
export function projectFlick(velocity: number, decay = 0.0006): number {
  return (velocity * Math.abs(velocity)) / (2 * decay) / 1000
}

export interface DragOptions {
  axis?: 'x' | 'y' | 'both'
  /** Movement below this is treated as a tap, so a scroll never steals a click. */
  threshold?: number
  onStart?: () => void
  onMove: (state: { dx: number; dy: number; event: PointerEvent }) => void
  onEnd: (state: { dx: number; dy: number; vx: number; vy: number }) => void
}

/**
 * Attach a pointer drag to an element. Returns a disposer.
 *
 * Uses pointer capture so a fast drag that leaves the element still reports
 * its own release, and locks to one axis once the intent is clear so a
 * vertical sheet drag cannot fight a horizontal carousel.
 */
export function draggable(el: HTMLElement, options: DragOptions): () => void {
  const { axis = 'both', threshold = 4, onStart, onMove, onEnd } = options
  let active = false
  let locked: 'x' | 'y' | null = axis === 'both' ? null : axis
  let startX = 0
  let startY = 0
  let samples: DragSample[] = []

  const down = (event: PointerEvent) => {
    if (!event.isPrimary) return
    active = true
    locked = axis === 'both' ? null : axis
    startX = event.clientX
    startY = event.clientY
    samples = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }]
    el.setPointerCapture(event.pointerId)
    onStart?.()
  }

  const move = (event: PointerEvent) => {
    if (!active) return
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp })
    if (samples.length > 12) samples.shift()

    if (locked === null) {
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return
      locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }

    onMove({ dx: locked === 'y' ? 0 : dx, dy: locked === 'x' ? 0 : dy, event })
  }

  const up = (event: PointerEvent) => {
    if (!active) return
    active = false
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    onEnd({
      dx: event.clientX - startX,
      dy: event.clientY - startY,
      vx: velocityFrom(samples, 'x'),
      vy: velocityFrom(samples, 'y'),
    })
    samples = []
  }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)

  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
}

/** Progress 0→1 eased, for driving a scrubbed animation from a drag. */
export const scrub = (progress: number) => easeOutCubic(Math.min(1, Math.max(0, progress)))
