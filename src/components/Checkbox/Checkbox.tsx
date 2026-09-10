import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useFieldControl } from '../Field/Field'
import type { MaySize } from '../../types'
import './Checkbox.css'

/** No `xs`: the box would fall under the 44px touch target it has to fill. */
export type CheckboxSize = Exclude<MaySize, 'xs'>

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'> {
  /**
   * Label text beside the box. Give the Checkbox children *or* the surrounding
   * `<Field>` a label — both name the same input, so using both reads out as
   * one run-on sentence.
   */
  children?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  /** @default 'md' */
  size?: CheckboxSize
  /**
   * Mixed state — some but not all of the things this checkbox covers are on.
   * Draws a dash instead of a tick and takes precedence over `checked`.
   */
  indeterminate?: boolean
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  /** Convenience over `onChange` — receives the next state alone. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * A checkbox.
 *
 * The tick **draws** along its own path when checked rather than appearing:
 * the stroke is normalised with `pathLength="1"`, so a single
 * `stroke-dashoffset` transition covers every size, and it rides the bouncy
 * spring so the stroke snaps into place instead of sliding.
 *
 * The visible state is driven by the input's own `:checked` and
 * `:indeterminate` pseudo-classes, not by React state, so an uncontrolled
 * checkbox — inside a plain `<form>`, restored by the browser, reset by a
 * sibling — always paints what it actually is.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    children,
    description,
    size = 'md',
    indeterminate = false,
    invalid,
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
  const field = useFieldControl({ id, invalid, required, disabled, 'aria-describedby': describedBy })
  const isDisabled = Boolean(field.disabled)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { pressProps } = usePressFeedback(isDisabled)
  const [innerChecked, setInnerChecked] = useState(Boolean(defaultChecked))
  const isChecked = checked ?? innerChecked

  // `indeterminate` is a DOM property with no HTML attribute, so React cannot
  // set it from JSX. Clicking the box also clears the property natively, and a
  // controlled caller that ignores that click never re-renders — so this syncs
  // on every render rather than on a dependency, at the cost of one assignment.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  })

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

  return (
    <label
      {...pressProps}
      data-slot="checkbox"
      data-size={size}
      data-checked={isChecked && !indeterminate ? 'true' : undefined}
      data-indeterminate={indeterminate ? 'true' : undefined}
      data-invalid={field.invalid ? 'true' : undefined}
      /* aria-disabled, not just the input's `disabled`: base.css gates its
       * shared hover highlight on exactly this attribute, so a disabled row
       * that skipped it would still light up under a mouse. */
      aria-disabled={isDisabled || undefined}
      className={cx('may-checkbox', 'may-pressable', 'may-hoverable', className)}
      style={style}
    >
      <input
        {...rest}
        ref={attachRef}
        id={field.id}
        type="checkbox"
        className="may-checkbox__input may-sr-only"
        disabled={isDisabled}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field['aria-describedby']}
        onChange={handleChange}
        {...(checked !== undefined ? { checked } : { defaultChecked })}
      />
      <span className="may-checkbox__box">
        <svg className="may-checkbox__tick" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path
            d="M5.5 12.5L10 17L18.5 7"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="may-checkbox__dash" aria-hidden />
      </span>
      {(children != null || description != null) && (
        <span className="may-checkbox__text">
          {children != null && <span className="may-checkbox__label">{children}</span>}
          {description != null && <span className="may-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  )
})
