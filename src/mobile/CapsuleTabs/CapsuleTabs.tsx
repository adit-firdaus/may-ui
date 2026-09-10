import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { applyThumb, geometryFor } from '../../motion/sliding-thumb'
import type { MaySize } from '../../types'
import './CapsuleTabs.css'

export interface CapsuleTab {
  /** Identity of the tab — what `onValueChange` reports. */
  value: string
  label: ReactNode
  /** Leading glyph, sized to the label by CSS. */
  icon?: ReactNode
  /** A count riding inside the capsule, the way App Store hangs one off a filter. */
  count?: number
  disabled?: boolean
}

/**
 * `filled` is the capsule of solid tint — App Store's search filters. `tinted`
 * is the same capsule as a wash, for a strip that must not out-shout the
 * content under it. `surface` recesses the whole track and floats the selected
 * pill on it, which is SegmentedControl's shape stretched into a scroller.
 */
export type CapsuleTabsVariant = 'filled' | 'tinted' | 'surface'

/** xs is deliberately absent: a chip that small stops being a touch target. */
export type CapsuleTabsSize = Exclude<MaySize, 'xs'>

export interface CapsuleTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CapsuleTab[]
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. Falls back to the first tab. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** @default 'filled' */
  variant?: CapsuleTabsVariant
  /** @default 'md' */
  size?: CapsuleTabsSize
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Bring the selected capsule into view.
 *
 * Two paths, because `scrollIntoView` scrolls *every* ancestor that needs to
 * move — which is right after a tap, and wrong on mount: a strip sitting below
 * the fold would drag the whole page to itself as it hydrated. On mount the
 * scroller alone is nudged, and only when the chip is genuinely off its
 * trailing edge. The peek is read back from the element's own
 * `scroll-padding-inline`, so the two paths can never disagree about it.
 */
function revealChip(
  scroller: HTMLElement | null,
  chip: HTMLElement | null,
  { onMount, reducedMotion }: { onMount: boolean; reducedMotion: boolean },
) {
  if (!chip) return

  if (!onMount) {
    chip.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
    return
  }

  if (!scroller || chip.getBoundingClientRect().right <= scroller.getBoundingClientRect().right) {
    return
  }
  const peek = parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) || 0
  scroller.scrollLeft = Math.max(0, chip.offsetLeft - peek)
}

/**
 * A scrolling strip of capsules with a thumb that slides between them.
 *
 * Two things make it read as iOS rather than as a row of chips.
 *
 * The thumb *moves*. It is laid out once at 1px wide and positioned entirely
 * with translate + scale by the same `applyThumb` that drives SegmentedControl,
 * so a selection change never touches layout — and, unlike a cross-fade between
 * two indicators, it tells you where the selection went.
 *
 * And the strip follows the selection: choosing a tab that is half off the edge
 * scrolls it back into view, with a chip's worth of peek left at either end so
 * the strip never looks like it has run out.
 *
 * Unlike SegmentedControl the thumb is not draggable. On a strip that scrolls,
 * a horizontal drag already belongs to the scroller, and a control that fights
 * its own scroll container for the same gesture loses both.
 */
export function CapsuleTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'filled',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  ...rest
}: CapsuleTabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value ?? '')
  const current = value ?? internal
  const reducedMotion = useReducedMotion()

  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const firstPaint = useRef(true)
  const lastValue = useRef<string | null>(null)

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === current),
  )

  const position = useCallback((index: number, animate: boolean) => {
    const track = trackRef.current
    const thumb = thumbRef.current
    const chip = chipRefs.current[index]
    if (!track || !thumb || !chip) return

    // Every measurement first, then every write: interleaving them makes the
    // browser flush layout twice for one selection change.
    const geometry = geometryFor(track, chip)
    const radius = thumb.offsetHeight / 2
    if (geometry.width <= 0) return

    applyThumb(thumb, geometry, { reducedMotion: !animate })

    /*
     * The thumb is 1px wide and stretched by scaleX, and a border radius is
     * stretched with it — which is why the underline in Tabs is square and
     * accepts it. A capsule cannot: authored as `--may-radius-full` the corner
     * would render as a shear across half the pill. Dividing the horizontal
     * half of the radius by the same factor the transform multiplies it by
     * cancels the stretch exactly, leaving circular ends at every width. The
     * browser's own clamping then handles the case where the pill is narrower
     * than it is tall, which is the answer we wanted there anyway.
     */
    if (radius > 0) thumb.style.borderRadius = `${radius / geometry.width}px / ${radius}px`
  }, [])

  useIsomorphicLayoutEffect(() => {
    // Never animate into place on first paint — the thumb would fly in from the
    // strip's leading edge on every mount.
    const settled = !firstPaint.current && !reducedMotion
    position(selectedIndex, settled)

    // Only on a real change: re-running this every render would fight a user
    // who is mid-scroll through a long strip.
    if (lastValue.current !== current) {
      lastValue.current = current
      revealChip(scrollerRef.current, chipRefs.current[selectedIndex], {
        onMount: firstPaint.current,
        reducedMotion,
      })
    }

    firstPaint.current = false
  }, [current, selectedIndex, position, reducedMotion, items.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') return
    // A resize is not a selection: snap, never slide.
    const observer = new ResizeObserver(() => position(selectedIndex, false))
    observer.observe(track)
    return () => observer.disconnect()
  }, [position, selectedIndex])

  const select = (next: string) => {
    if (value === undefined) setInternal(next)
    if (next !== current) onValueChange?.(next)
  }

  /**
   * Roving focus with automatic activation — arrowing through the strip selects
   * as it goes, which is the ARIA default for tabs and what a UIKit segmented
   * control does. Disabled chips are stepped over rather than landed on, so the
   * wrap-around never dead-ends.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    let next = -1

    if (step !== 0) {
      next = selectedIndex
      for (let i = 0; i < items.length; i++) {
        next = (next + step + items.length) % items.length
        if (!items[next]?.disabled) break
      }
    } else if (event.key === 'Home') {
      next = items.findIndex((item) => !item.disabled)
    } else if (event.key === 'End') {
      for (let i = items.length - 1; i >= 0; i--) {
        if (!items[i]?.disabled) {
          next = i
          break
        }
      }
    } else {
      return
    }

    if (next < 0 || items[next]?.disabled) return
    // Claimed only once a move is certain, so Escape and Enter still reach
    // whatever the strip is nested inside.
    event.preventDefault()
    select(items[next]!.value)
    chipRefs.current[next]?.focus()
  }

  return (
    <div
      {...rest}
      ref={scrollerRef}
      data-slot="capsule-tabs"
      data-variant={variant}
      data-size={size}
      className={cx('may-capsule-tabs', className)}
    >
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        className="may-capsule-tabs__track"
        onKeyDown={onKeyDown}
      >
        {/*
         * Measured against the track, which does not itself scroll — the
         * scroller is its parent. That is what lets the geometry skip any
         * scroll-offset correction, and it is why the two are separate nodes.
         */}
        <span ref={thumbRef} className="may-capsule-tabs__thumb" aria-hidden />
        {items.map((item, index) => (
          <CapsuleTabChip
            key={item.value}
            chipRef={(node) => {
              chipRefs.current[index] = node
            }}
            item={item}
            selected={item.value === current}
            onSelect={select}
          />
        ))}
      </div>
    </div>
  )
}

interface CapsuleTabChipProps {
  item: CapsuleTab
  selected: boolean
  onSelect: (value: string) => void
  chipRef: (node: HTMLButtonElement | null) => void
}

/**
 * One capsule. Split out because the press hook cannot be called from inside a
 * `map`. The ref travels under its own name rather than as `ref`, which React
 * intercepts before a function component ever sees it — and `forwardRef` would
 * buy nothing, since nothing outside this file holds one of these.
 */
function CapsuleTabChip({ item, selected, onSelect, chipRef }: CapsuleTabChipProps) {
  const { pressProps } = usePressFeedback(item.disabled)

  return (
    <button
      {...pressProps}
      ref={chipRef}
      type="button"
      role="tab"
      aria-selected={selected}
      // Roving tabindex: the strip is one Tab stop and the arrow keys move
      // within it. Twelve genres must not cost twelve Tab presses.
      tabIndex={selected ? 0 : -1}
      disabled={item.disabled}
      data-slot="capsule-tab"
      onClick={() => onSelect(item.value)}
      className={cx('may-capsule-tabs__chip', 'may-pressable', 'may-hoverable')}
    >
      {item.icon && (
        <span className="may-capsule-tabs__icon" aria-hidden>
          {item.icon}
        </span>
      )}
      <span className="may-capsule-tabs__label">{item.label}</span>
      {item.count != null && <span className="may-capsule-tabs__count">{item.count}</span>}
    </button>
  )
}
