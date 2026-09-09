import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { applyThumb, geometryFor, segmentAt } from '../../motion/sliding-thumb'
import type { MaySize } from '../../types'
import './SegmentedControl.css'

export interface SegmentedOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  /** Controlled value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * iOS's segmented control.
 *
 * The thumb **slides** between segments and can be dragged, which is the part
 * that reads as iOS — both reference implementations cross-fade an indicator
 * between segments instead, and it is the most conspicuous missing motion in
 * either. Positioning is transform-only so it stays on the compositor.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? '')
  const current = value ?? internal
  const reducedMotion = useReducedMotion()

  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [dragging, setDragging] = useState(false)
  const firstPaint = useRef(true)

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  )

  const position = useCallback(
    (index: number, opts: { following?: boolean; pressed?: boolean } = {}) => {
      const track = trackRef.current
      const thumb = thumbRef.current
      const segment = segmentRefs.current[index]
      if (!track || !thumb || !segment) return
      applyThumb(thumb, geometryFor(track, segment), {
        ...opts,
        // Never animate into place on first paint — the thumb would fly in
        // from the leading edge on every mount.
        reducedMotion: reducedMotion || firstPaint.current,
      })
    },
    [reducedMotion],
  )

  useIsomorphicLayoutEffect(() => {
    position(selectedIndex, { pressed: dragging })
    firstPaint.current = false
  }, [selectedIndex, dragging, position, options.length])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !trackRef.current) return
    const ro = new ResizeObserver(() => position(selectedIndex))
    ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [position, selectedIndex])

  const commit = (next: string) => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  /** Dragging across the control selects as you go, the way iOS does. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    setDragging(true)
    trackRef.current?.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const segments = segmentRefs.current.filter(Boolean) as HTMLElement[]
    const index = segmentAt(segments, event.clientX)
    if (index >= 0 && !options[index]?.disabled) commit(options[index]!.value)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragging(false)
    if (trackRef.current?.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    let next = selectedIndex
    for (let i = 0; i < options.length; i++) {
      next = (next + delta + options.length) % options.length
      if (!options[next]?.disabled) break
    }
    commit(options[next]!.value)
    segmentRefs.current[next]?.focus()
  }

  return (
    <div
      {...rest}
      ref={trackRef}
      role="tablist"
      data-slot="segmented"
      data-size={size}
      data-dragging={dragging ? 'true' : undefined}
      className={cx('may-segmented', fullWidth && 'may-segmented--full', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <span ref={thumbRef} className="may-segmented__thumb" aria-hidden />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            segmentRefs.current[index] = node
          }}
          type="button"
          role="tab"
          aria-selected={option.value === current}
          tabIndex={option.value === current ? 0 : -1}
          disabled={option.disabled}
          onClick={() => commit(option.value)}
          className="may-segmented__segment"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
