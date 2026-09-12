import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSlidingThumb } from '../../motion/useSlidingThumb'
import type { MaySize } from '../../types'

/** A gentle puff — the chips sit close, so the pill stays inside its lane. */
const PRESS_SCALE = 1.1

export interface CapsuleTab<T extends string = string> {
  /** Identity of the tab — what `onValueChange` reports. */
  value: T
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

export interface CapsuleTabsProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CapsuleTab<T>[]
  /** Controlled selection. */
  value?: T
  /** Uncontrolled initial selection. Falls back to the first tab. */
  defaultValue?: T
  onValueChange?: (value: T) => void
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
export function CapsuleTabs<T extends string = string>({
  items = [],
  value,
  defaultValue,
  onValueChange,
  variant = 'filled',
  size = 'md',
  className,
  'aria-label': ariaLabel,
  ...rest
}: CapsuleTabsProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? items[0]?.value)
  const current = value ?? internal
  const reducedMotion = useReducedMotion()

  const scrollerRef = useRef<HTMLDivElement>(null)
  const firstPaint = useRef(true)
  const lastValue = useRef<T | null | undefined>(null)

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === current),
  )

  /*
   * The thumb, the radius correction, the squish and the reflow-on-resize all
   * live in `useSlidingThumb`. No `onSelect`, so it is press-only: on a strip
   * that scrolls, a horizontal drag already belongs to the scroller, and a
   * control that fights its own scroll container for the same gesture loses
   * both.
   */
  const { trackRef, thumbRef, registerItem, onPointerDown } = useSlidingThumb<
    HTMLDivElement,
    HTMLButtonElement
  >({
    itemCount: items.length,
    selectedIndex,
    roundEnds: true,
    pressScale: PRESS_SCALE,
  })

  // The strip follows the selection: choosing a chip half off the edge scrolls
  // it back into view. Positioning is the hook's; this is only the scroll.
  useIsomorphicLayoutEffect(() => {
    if (lastValue.current !== current) {
      revealChip(scrollerRef.current, trackRef.current?.querySelector<HTMLElement>(
        '[data-slot="capsule-tab"][aria-selected="true"]',
      ) ?? null, {
        onMount: firstPaint.current,
        reducedMotion,
      })
      lastValue.current = current
    }
    firstPaint.current = false
  }, [current, reducedMotion])

  const select = (next: T) => {
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
    trackRef.current
      ?.querySelectorAll<HTMLButtonElement>('[data-slot="capsule-tab"]')
      [next]?.focus()
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
        onPointerDown={onPointerDown}
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
            chipRef={registerItem(index)}
            item={item}
            selected={item.value === current}
            onSelect={select}
          />
        ))}
      </div>
    </div>
  )
}

interface CapsuleTabChipProps<T extends string = string> {
  item: CapsuleTab<T>
  selected: boolean
  onSelect: (value: T) => void
  chipRef: (node: HTMLButtonElement | null) => void
}

/**
 * One capsule. Split out because the press hook cannot be called from inside a
 * `map`. The ref travels under its own name rather than as `ref`, which React
 * intercepts before a function component ever sees it — and `forwardRef` would
 * buy nothing, since nothing outside this file holds one of these.
 */
function CapsuleTabChip<T extends string = string>({ item, selected, onSelect, chipRef }: CapsuleTabChipProps<T>) {
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
