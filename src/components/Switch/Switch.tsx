import type { ChangeEvent, InputHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useFieldControl } from '../Field/Field'
import { draggable } from '../../motion/gesture'
import type { MaySize } from '../../types'

/** No `xs`: below `sm` the thumb is too small to read as a physical object. */
export type SwitchSize = Exclude<MaySize, 'xs'>

/** Movement under this is a tap, not a drag — the label's own click handles it. */
const DRAG_THRESHOLD = 4

/** px/ms past which a flick decides the toggle, wherever the finger let go. */
const FLICK_VELOCITY = 0.35

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'> {
  /**
   * Label text. Sits at the leading edge, as iOS Settings puts it. Give the
   * Switch children *or* the surrounding `<Field>` a label — both name the same
   * input, so using both reads out as one run-on sentence.
   */
  children?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  /** @default 'md' */
  size?: SwitchSize
  /** Which side the label sits on. @default 'start' */
  labelPosition?: 'start' | 'end'
  /** Convenience over `onChange` — receives the next state alone. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * The iOS toggle.
 *
 * Four details do the work, and all four are usually missing from ports:
 * the thumb **overshoots** past its end position before settling (that is
 * --may-spring-bouncy, not an ease), it **widens** while held the way a real
 * physical switch takes the pressure, the track fills in the same beat rather
 * than after it, and the thumb can be **dragged** across instead of tapped.
 *
 * The visible state hangs off the input's own `:checked`, so an uncontrolled
 * switch inside a plain `<form>` — reset, restored, autofilled — always paints
 * what it actually is.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    children,
    description,
    size = 'md',
    labelPosition = 'start',
    onCheckedChange,
    onChange,
    checked,
    defaultChecked,
    disabled,
    required,
    id,
    className,
    style,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, required, disabled, 'aria-describedby': describedBy })
  const isDisabled = Boolean(field.disabled)
  const { pressProps } = usePressFeedback(isDisabled)
  const [innerChecked, setInnerChecked] = useState(Boolean(defaultChecked))
  const isChecked = checked ?? innerChecked

  const rootRef = useRef<HTMLLabelElement | null>(null)
  const trackRef = useRef<HTMLSpanElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  /** True once the current gesture has travelled far enough to count as a drag. */
  const dragged = useRef(false)

  const attachRef = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) setInnerChecked(event.target.checked)
    onCheckedChange?.(event.target.checked)
    onChange?.(event)
  }

  /*
   * Drag the thumb across, the way the real switch works.
   *
   * The finger's position is written straight to a CSS custom property rather
   * than through React state: a re-render per pointermove would put the whole
   * component tree on the animation frame for a value only one element reads.
   * The commit at the end goes through the input's own `click()` so a
   * controlled caller, an uncontrolled form and React's onChange all see the
   * same event they would from a tap.
   */
  useEffect(() => {
    const track = trackRef.current
    const root = rootRef.current
    if (!track || !root || isDisabled) return

    let travel = 0
    let from = 0
    let dir = 1

    return draggable(track, {
      axis: 'x',
      onStart: () => {
        const rect = track.getBoundingClientRect()
        // The thumb's run is the track minus its own diameter, which is the
        // track's height — the same relation the CSS derives --may-switch-travel
        // from, so JS and CSS cannot disagree about where "on" is.
        travel = rect.width - rect.height
        from = inputRef.current?.checked ? 1 : 0
        // Under RTL the thumb travels leftwards, so a rightward drag turns it
        // off. The CSS mirrors the same way, through --may-switch-dir.
        dir = getComputedStyle(track).direction === 'rtl' ? -1 : 1
        dragged.current = false
      },
      onMove: ({ dx }) => {
        if (!dragged.current) {
          if (Math.abs(dx) < DRAG_THRESHOLD) return
          dragged.current = true
          root.dataset.dragging = 'true'
        }
        root.style.setProperty('--may-switch-drag', String(progressAt(from, dx * dir, travel)))
      },
      onEnd: ({ dx, vx }) => {
        if (!dragged.current) return // a tap: the label's own click owns it
        delete root.dataset.dragging
        root.style.removeProperty('--may-switch-drag')

        // A flick beats position: throwing the thumb toward one end commits to
        // that end even if the finger never crossed the middle.
        const progress = progressAt(from, dx * dir, travel)
        const next = Math.abs(vx) > FLICK_VELOCITY ? vx * dir > 0 : progress > 0.5
        if (next !== Boolean(inputRef.current?.checked)) inputRef.current?.click()
      },
    })
  }, [isDisabled])

  /*
   * A drag ends with a click on the label, and the label's job is to activate
   * the control — which would undo the toggle the drag just committed. The
   * synthetic click from `input.click()` above is ours and must pass through;
   * anything else during a drag is the browser's and is cancelled.
   */
  const suppressDragClick = (event: MouseEvent<HTMLLabelElement>) => {
    if (!dragged.current || event.target === inputRef.current) return
    event.preventDefault()
    dragged.current = false
  }

  const text = (children != null || description != null) && (
    <span className="may-switch__text">
      {children != null && <span className="may-switch__label">{children}</span>}
      {description != null && <span className="may-switch__description">{description}</span>}
    </span>
  )

  return (
    <label
      {...pressProps}
      ref={rootRef}
      data-slot="switch"
      data-size={size}
      data-checked={isChecked ? 'true' : undefined}
      data-label-position={labelPosition}
      /* aria-disabled, not just the input's `disabled`: base.css gates its
       * shared hover highlight on exactly this attribute, so a disabled row
       * that skipped it would still light up under a mouse. */
      aria-disabled={isDisabled || undefined}
      className={cx('may-switch', 'may-pressable', 'may-hoverable', className)}
      style={style}
      onClickCapture={suppressDragClick}
    >
      {labelPosition === 'start' && text}
      <input
        {...rest}
        ref={attachRef}
        id={field.id}
        type="checkbox"
        role="switch"
        className="may-switch__input may-sr-only"
        disabled={isDisabled}
        required={field.required}
        aria-describedby={field['aria-describedby']}
        onChange={handleChange}
        {...(checked !== undefined ? { checked } : { defaultChecked })}
      />
      <span ref={trackRef} className="may-switch__track" aria-hidden>
        <span className="may-switch__thumb" />
      </span>
      {labelPosition === 'end' && text}
    </label>
  )
})

/** Where the thumb sits, 0 → 1, for a drag of `dx` from state `from`. */
function progressAt(from: number, dx: number, travel: number): number {
  if (travel <= 0) return from
  return Math.min(1, Math.max(0, from + dx / travel))
}
