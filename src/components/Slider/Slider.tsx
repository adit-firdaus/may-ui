import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { draggable } from '../../motion/gesture'
import type { MayTone } from '../../types'
import './Slider.css'

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value. */
  value?: number
  /** Uncontrolled initial value. Defaults to `min`. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** @default 0 */
  min?: number
  /** @default 100 */
  max?: number
  /** Granularity of both the drag and the arrow keys. @default 1 */
  step?: number
  disabled?: boolean
  /** Show the current value at the trailing edge. */
  showValue?: boolean
  /** Formats `showValue` and the value announced to assistive tech. */
  formatValue?: (value: number) => string
  /** `true` draws a mark at every step; an array draws marks at those values. */
  ticks?: boolean | number[]
  /** Colour of the filled portion. @default 'tint' */
  tone?: MayTone
  /** Icon at the leading edge — the small sun on a brightness slider. */
  leading?: ReactNode
  /** Icon at the trailing edge — the large sun. */
  trailing?: ReactNode
}

/** Past this many marks the ticks read as a solid band, so we draw none. */
const MAX_TICKS = 40

/**
 * Snap to the nearest step and clamp.
 *
 * The `toFixed` pass is not cosmetic: a 0.1 step accumulates binary dust
 * (0.30000000000000004) that would then be handed to `onValueChange` and
 * printed by `showValue`.
 */
function quantize(raw: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, raw))
  if (!(step > 0)) return clamped
  const snapped = min + Math.round((clamped - min) / step) * step
  const decimals = (String(step).split('.')[1] ?? '').length
  return Number(Math.min(max, Math.max(min, snapped)).toFixed(decimals))
}

/**
 * A slider.
 *
 * The rail is a fill and the filled portion is the tint — no strokes anywhere.
 * The thumb is dragged with the pointer and driven with the keyboard from the
 * same state, and it grows under the finger the whole time it is held, which
 * is the feedback iOS gives in place of a press-in.
 *
 * Position is a CSS custom property (`--may-slider-pct`) rather than inline
 * geometry, so one number set on the root moves the thumb, the fill and the
 * value label together.
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  formatValue,
  ticks = false,
  tone = 'tint',
  leading,
  trailing,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: SliderProps) {
  const [internal, setInternal] = useState(() => quantize(defaultValue ?? min, min, max, step))
  const [dragging, setDragging] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLButtonElement>(null)

  // A controlled value is clamped for geometry but deliberately not snapped:
  // the owner is allowed to render 33.3 on a step of 1, and re-snapping it
  // here would silently disagree with its own state.
  const current = Math.min(max, Math.max(min, value ?? internal))
  const pct = max > min ? (current - min) / (max - min) : 0

  const commit = useCallback(
    (next: number) => {
      const snapped = quantize(next, min, max, step)
      if (snapped === current) return
      if (value === undefined) setInternal(snapped)
      onValueChange?.(snapped)
    },
    [current, min, max, step, value, onValueChange],
  )

  /*
   * The drag effect must not re-run while a finger is down: `draggable` keeps
   * its active flag in a closure, so tearing it down mid-gesture would leave
   * the rest of the drag reporting nothing. Everything that changes per value
   * is therefore read through a ref, and the effect depends only on `disabled`.
   */
  const latest = useRef({ min, max, step, commit })
  useEffect(() => {
    latest.current = { min, max, step, commit }
  })

  useEffect(() => {
    const track = trackRef.current
    if (!track || disabled) return

    /** Where the finger sat relative to the thumb's centre when the drag began. */
    let grabOffset = 0
    /** A secondary button opens a context menu; it must not scrub the value. */
    let armed = false

    const valueAt = (clientX: number) => {
      const { min: lo, max: hi, step: s } = latest.current
      const rect = track.getBoundingClientRect()
      // The thumb's centre travels between half a thumb from each end, so the
      // usable range is the track minus one whole thumb.
      //
      // offsetWidth rather than the bounding box: the thumb is scaled up for
      // the whole drag and a measured box would make the mapping drift as it
      // grows. offsetWidth is layout space while clientX is visual space, so
      // it is converted through the track's own pair of measurements —
      // otherwise a scaled ancestor (a zoomed preview) skews the whole track.
      const zoom = track.offsetWidth > 0 ? rect.width / track.offsetWidth : 1
      const thumbSize = (thumbRef.current?.offsetWidth ?? 0) * zoom
      const usable = rect.width - thumbSize
      if (usable <= 0) return lo
      const t = (clientX - rect.left - thumbSize / 2) / usable
      return quantize(lo + t * (hi - lo), lo, hi, s)
    }

    // Registered before `draggable`'s own listener, so the offset is set before
    // the first move can be reported.
    const onDown = (event: PointerEvent) => {
      armed = event.button === 0
      if (!armed) return
      const thumb = thumbRef.current
      const onThumb = !!thumb && event.target instanceof Node && thumb.contains(event.target)
      if (onThumb) {
        const rect = thumb.getBoundingClientRect()
        grabOffset = rect.left + rect.width / 2 - event.clientX
      } else {
        // Pressing the rail jumps to the finger and keeps tracking from there,
        // rather than making the user hunt for a 28px target first.
        grabOffset = 0
        latest.current.commit(valueAt(event.clientX))
      }
      // Hand focus to the thumb so the keyboard carries on from where the
      // finger stopped. Pointer focus is not :focus-visible, so no ring appears.
      thumb?.focus({ preventScroll: true })
    }

    track.addEventListener('pointerdown', onDown)
    const stop = draggable(track, {
      axis: 'x',
      onStart: () => {
        if (armed) setDragging(true)
      },
      // Absolute position, not accumulated delta — a dropped move event then
      // costs a frame of smoothness rather than permanent drift.
      onMove: ({ event }) => {
        if (armed) latest.current.commit(valueAt(event.clientX + grabOffset))
      },
      onEnd: () => setDragging(false),
    })

    return () => {
      track.removeEventListener('pointerdown', onDown)
      stop()
    }
  }, [disabled])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // A tenth of the range is the coarse increment, unless the step is coarser.
    const big = Math.max(step, (max - min) / 10)
    const amount = event.shiftKey ? big : step
    let next: number | null = null

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + amount
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - amount
        break
      case 'PageUp':
        next = current + big
        break
      case 'PageDown':
        next = current - big
        break
      case 'Home':
        next = min
        break
      case 'End':
        next = max
        break
      default:
        return
    }

    // Arrows and the Page keys scroll the page otherwise.
    event.preventDefault()
    commit(next)
  }

  /**
   * Marks are filtered here rather than in the markup so the degenerate range
   * (`max === min`) is dealt with once: mapping a value onto a zero-width
   * range yields NaN, and a NaN in `inset-inline-start` silently collapses
   * every mark onto the leading edge instead of failing loudly.
   */
  const tickValues = useMemo(() => {
    if (max <= min) return []
    const raw = Array.isArray(ticks)
      ? ticks
      : (() => {
          if (!ticks || !(step > 0)) return []
          const count = Math.round((max - min) / step)
          if (count < 1 || count > MAX_TICKS) return []
          return Array.from({ length: count + 1 }, (_, i) => min + i * step)
        })()
    // A caller-supplied array may hold repeats or values off the ends; both
    // would draw a mark on a spot the thumb can never reach.
    const seen = new Set<number>()
    return raw.filter((v) => {
      if (v < min || v > max || seen.has(v)) return false
      seen.add(v)
      return true
    })
  }, [ticks, min, max, step])

  const display = formatValue ? formatValue(current) : String(current)

  return (
    <div
      {...rest}
      data-slot="slider"
      data-tone={tone}
      data-dragging={dragging ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-slider', className)}
      style={{ ...style, '--may-slider-pct': pct } as CSSProperties}
    >
      {leading && (
        <span className="may-slider__adornment" aria-hidden>
          {leading}
        </span>
      )}

      <div ref={trackRef} className="may-slider__control">
        <span className="may-slider__rail">
          {/* Ticks sit under the fill on purpose: they read as notches cut out
              of the unfilled rail, and vanish as the tint passes over them. */}
          {tickValues.length > 0 && (
            <span className="may-slider__ticks" aria-hidden>
              {tickValues.map((tick) => (
                <span
                  key={tick}
                  className="may-slider__tick"
                  style={{ insetInlineStart: `${((tick - min) / (max - min)) * 100}%` }}
                />
              ))}
            </span>
          )}
          <span className="may-slider__fill" />
        </span>

        {/*
         * A real <button>, not a div with a tabindex: it is focusable, it is
         * reachable by switch access, and role="slider" gives it the value
         * semantics on top. There is no `may-pressable` here because the press
         * feedback is inverted — the thumb grows toward the finger rather than
         * sinking away from it — and `data-dragging` is already true from the
         * moment of pointerdown, so the grow needs no second source of truth.
         */}
        <button
          ref={thumbRef}
          type="button"
          role="slider"
          className="may-slider__thumb"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={formatValue ? display : undefined}
          onKeyDown={onKeyDown}
        />
      </div>

      {trailing && (
        <span className="may-slider__adornment" aria-hidden>
          {trailing}
        </span>
      )}

      {showValue && <span className="may-slider__value">{display}</span>}
    </div>
  )
}
