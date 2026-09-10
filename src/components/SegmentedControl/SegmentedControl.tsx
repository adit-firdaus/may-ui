import type { KeyboardEvent } from 'react'
import { useState } from 'react'
import { cx } from '../../utils/cx'
import { useSlidingThumb } from '../../motion/useSlidingThumb'
import type { MaySize } from '../../types'
import './SegmentedControl.css'

/*
 * How much the thumb puffs while held — the primitive's own default, and the
 * value ss-ui uses. It does overhang the track's 2px inset, which is the point:
 * a thumb that grows within its own groove reads as inflating, one that grows
 * past it reads as lifting off.
 */
const PRESS_SCALE = 1.16

/*
 * The sheet curve, which is what ss-ui settles on, and 340ms — the same clock
 * `--may-duration-settle` carries for the rest of the system. Both were tuned
 * by watching the control rather than guessed; the git history has the walk
 * from 340 down to 220 and back if the numbers ever look arbitrary.
 */
const SETTLE_EASING = 'var(--may-ease-sheet)'
const SETTLE_MS = 340

export interface SegmentedOption<T extends string = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * Generic over the option value, so a union survives the round trip: with
 * `options` typed `'id' | 'en'`, `onValueChange` hands back `'id' | 'en'`
 * rather than `string`, and the cast every typed call site needed disappears.
 */
export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  /** Controlled value. */
  value?: T
  /** Uncontrolled initial value. */
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * iOS's segmented control.
 *
 * The thumb **slides** between segments and can be dragged, which is the part
 * that reads as iOS — both reference implementations cross-fade an indicator
 * between segments instead. The whole gesture — slide, press squish, elastic
 * overdrag, select-on-release — lives in `useSlidingThumb`; this component owns
 * the selection, the keyboard, and the track fill that squeezes under the press.
 */
export function SegmentedControl<T extends string = string>({
  options = [],
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value)
  const current = value ?? internal

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  )

  const commit = (next: T) => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const { trackRef, thumbRef, registerItem, onPointerDown } = useSlidingThumb<
    HTMLDivElement,
    HTMLButtonElement
  >({
    itemCount: options.length,
    selectedIndex,
    onSelect: (index) => commit(options[index]!.value),
    isDisabled: (index) => Boolean(options[index]?.disabled),
    roundEnds: true,
    pressScale: PRESS_SCALE,
    easing: SETTLE_EASING,
    settleMs: SETTLE_MS,
  })

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
    trackRef.current
      ?.querySelectorAll<HTMLButtonElement>('.may-segmented__segment')
      [next]?.focus()
  }

  return (
    <div
      {...rest}
      ref={trackRef}
      role="tablist"
      data-slot="segmented"
      data-size={size}
      className={cx('may-segmented', fullWidth && 'may-segmented--full', className)}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <span ref={thumbRef} className="may-segmented__thumb" aria-hidden />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={registerItem(index)}
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
