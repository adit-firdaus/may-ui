import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldContext } from '../Field/Field'
import { useAutoId } from '../../utils/useId'
import type { MaySize } from '../../types'
import './Checkbox.css'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Text beside the box. */
  children?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  /** @default 'md' */
  size?: MaySize
  /** Render the dash state for a partially-selected group. @default false */
  indeterminate?: boolean
  invalid?: boolean
}

/** Boolean checkbox with its own label. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    children,
    description,
    size = 'md',
    indeterminate = false,
    invalid,
    className,
    disabled,
    id,
    ...rest
  },
  ref,
) {
  const field = useFieldContext()
  const innerRef = useRef<HTMLInputElement | null>(null)
  const autoId = useAutoId(id ?? field?.controlId)
  const descriptionId = `${autoId}-description`
  const isInvalid = invalid ?? field?.invalid ?? false
  const isDisabled = disabled ?? field?.disabled ?? false

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <div
      className={cx(
        'may-checkbox',
        `may-checkbox--${size}`,
        isDisabled && 'may-checkbox--disabled',
        className,
      )}
    >
      <input
        {...rest}
        type="checkbox"
        id={autoId}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={description ? descriptionId : field?.describedBy}
        className="may-checkbox__input"
        ref={(node) => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
      />
      <span className="may-checkbox__box" aria-hidden>
        <svg className="may-checkbox__check" viewBox="0 0 16 16" focusable="false">
          <path
            d="M3.5 8.5l3 3 6-6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="may-checkbox__dash" />
      </span>
      {(children || description) && (
        <span className="may-checkbox__text">
          {children && (
            <label className="may-checkbox__label" htmlFor={autoId}>
              {children}
            </label>
          )}
          {description && (
            <span className="may-checkbox__description" id={descriptionId}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  )
})
