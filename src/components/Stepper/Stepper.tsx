import type { HTMLAttributes } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { IoAdd, IoRemove } from 'react-icons/io5'
import type { MaySize } from '../../types'
import './Stepper.css'

export interface StepperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value. */
  value?: number
  /** Uncontrolled initial value. Defaults to `min`, or 0 when there is none. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** @default Number.NEGATIVE_INFINITY */
  min?: number
  /** @default Number.POSITIVE_INFINITY */
  max?: number
  /** @default 1 */
  step?: number
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  disabled?: boolean
  /** Announced when the value changes, and used for nothing visible. */
  formatValue?: (value: number) => string
  /** @default 'Decrease' */
  decrementLabel?: string
  /** @default 'Increase' */
  incrementLabel?: string
}

/*
 * Repeat timing. A press-and-hold has to start slowly enough that a deliberate
 * single tap never repeats, then accelerate, or reaching 50 from 0 is a chore.
 * These are UIStepper's proportions: a long first pause, then intervals that
 * shorten geometrically down to a floor fast enough to feel continuous but
 * still slow enough to stop on the number you wanted.
 */
const HOLD_DELAY = 480
const REPEAT_START = 260
const REPEAT_MIN = 42
const REPEAT_DECAY = 0.84

/**
 * Snap to the step grid and clamp. The `toFixed` pass keeps a 0.1 step from
 * accumulating binary dust (0.30000000000000004) and handing it to the owner.
 */
function quantize(raw: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, raw))
  if (!(step > 0) || !Number.isFinite(min)) return clamped
  const snapped = min + Math.round((clamped - min) / step) * step
  const decimals = (String(step).split('.')[1] ?? '').length
  return Number(Math.min(max, Math.max(min, snapped)).toFixed(decimals))
}

interface StepperHalfProps {
  action: 'decrement' | 'increment'
  label: string
  /** The whole control is off. */
  disabled: boolean
  /** This direction has nowhere left to go. */
  atLimit: boolean
  /** Pointer press: steps once immediately, then starts the repeat. */
  onPress: () => void
  onRelease: () => void
  /** Keyboard or assistive-tech activation, which never sends a pointer event. */
  onActivate: () => void
}

/**
 * A limit is announced with `aria-disabled`, not the `disabled` attribute, for
 * two reasons: a disabled element stops firing pointer events, so a hold that
 * runs into the limit would never see its own pointerup and would stay stuck
 * looking pressed; and a keyboard user counting up to the maximum would have
 * focus yanked out from under them at the last step.
 */
function StepperHalf({
  action,
  label,
  disabled,
  atLimit,
  onPress,
  onRelease,
  onActivate,
}: StepperHalfProps) {
  const inert = disabled || atLimit
  const { pressProps } = usePressFeedback(inert)

  return (
    <button
      {...pressProps}
      type="button"
      disabled={disabled}
      aria-disabled={atLimit || undefined}
      aria-label={label}
      data-action={action}
      data-press-squish="true"
      className="may-stepper__button may-pressable may-hoverable"
      onPointerDown={(event) => {
        pressProps.onPointerDown()
        // Secondary buttons open menus; they must not step the value.
        if (event.button === 0 && !inert) onPress()
      }}
      onPointerUp={() => {
        pressProps.onPointerUp()
        onRelease()
      }}
      onPointerCancel={() => {
        pressProps.onPointerCancel()
        onRelease()
      }}
      onPointerLeave={() => {
        pressProps.onPointerLeave()
        onRelease()
      }}
      onClick={(event) => {
        // `detail` counts pointer clicks, so 0 means this activation came from
        // Enter/Space or a screen reader — the only clicks that were not
        // already handled on pointerdown.
        if (event.detail === 0 && !inert) onActivate()
      }}
    >
      {action === 'increment' ? (
        <IoAdd aria-hidden focusable="false" />
      ) : (
        <IoRemove aria-hidden focusable="false" />
      )}
    </button>
  )
}

/**
 * iOS's stepper: two halves sharing one fill pill, split by a hairline.
 *
 * The behaviour that makes it feel native is the hold — a press that is kept
 * down starts repeating after a beat and then accelerates, so a run of 30
 * takes a second rather than thirty taps. The repeat stops dead at a limit
 * rather than ticking uselessly against it.
 */
export function Stepper({
  value,
  defaultValue,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  size = 'md',
  disabled = false,
  formatValue,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  className,
  ...rest
}: StepperProps) {
  const [internal, setInternal] = useState(() =>
    quantize(defaultValue ?? (Number.isFinite(min) ? min : 0), min, max, step),
  )
  const current = Math.min(max, Math.max(min, value ?? internal))

  /*
   * The repeat runs on timers, and a timer callback closes over the render it
   * was scheduled in. Reading the value through a ref — updated optimistically
   * by the step itself, then reconciled from props after every render — is what
   * lets a hold keep counting instead of applying the same +1 forever.
   */
  const valueRef = useRef(current)
  useEffect(() => {
    valueRef.current = current
  })

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => stop, [stop])

  /** Returns false when the value was already at the limit. */
  const bump = useCallback(
    (direction: 1 | -1) => {
      const from = valueRef.current
      const next = quantize(from + direction * step, min, max, step)
      if (next === from) return false
      valueRef.current = next
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
      return true
    },
    [step, min, max, value, onValueChange],
  )

  const startHold = useCallback(
    (direction: 1 | -1) => {
      stop()
      let interval = REPEAT_START
      const tick = () => {
        // A hold that has run into min or max is over; leaving the timer
        // running would keep the control feeling alive when it is not.
        if (!bump(direction)) {
          stop()
          return
        }
        interval = Math.max(REPEAT_MIN, interval * REPEAT_DECAY)
        timer.current = setTimeout(tick, interval)
      }
      timer.current = setTimeout(tick, HOLD_DELAY)
    },
    [bump, stop],
  )

  const press = useCallback(
    (direction: 1 | -1) => {
      bump(direction)
      startHold(direction)
    },
    [bump, startHold],
  )

  /*
   * A limit is "the next step would not move the value", not "the value equals
   * min or max". On a coarse grid the last reachable value can sit short of
   * the bound — min 0, max 10, step 3 tops out at 9 — and comparing against
   * the bound alone would leave that half looking live while doing nothing.
   */
  const canDecrement = quantize(current - step, min, max, step) !== current
  const canIncrement = quantize(current + step, min, max, step) !== current

  const display = formatValue ? formatValue(current) : String(current)

  return (
    <div
      {...rest}
      role="group"
      data-slot="stepper"
      data-size={size}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-stepper', className)}
    >
      <StepperHalf
        action="decrement"
        label={decrementLabel}
        disabled={disabled}
        atLimit={!canDecrement}
        onPress={() => press(-1)}
        onRelease={stop}
        onActivate={() => bump(-1)}
      />
      <StepperHalf
        action="increment"
        label={incrementLabel}
        disabled={disabled}
        atLimit={!canIncrement}
        onPress={() => press(1)}
        onRelease={stop}
        onActivate={() => bump(1)}
      />
      {/*
       * The stepper shows no number of its own — the row it sits in does. A
       * screen reader would otherwise hear "Increase" and never learn what it
       * increased to, so the value is announced politely instead.
       */}
      <span className="may-sr-only" aria-live="polite">
        {display}
      </span>
    </div>
  )
}
