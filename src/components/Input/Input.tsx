import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldContext } from '../Field/Field'
import type { MaySize } from '../../types'
import './Input.css'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** @default 'md' */
  size?: MaySize
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  /** Content pinned inside the left edge — an icon or a unit. */
  prefix?: ReactNode
  /** Content pinned inside the right edge. */
  suffix?: ReactNode
  /** @default false */
  fullWidth?: boolean
  /** Class name for the outer wrapper; `className` goes on the `<input>`. */
  wrapperClassName?: string
}

/** Single-line text control. Pair with `<Field>` for a label and error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    invalid,
    prefix,
    suffix,
    fullWidth = false,
    className,
    wrapperClassName,
    disabled,
    required,
    id,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false
  const isDisabled = disabled ?? field?.disabled ?? false

  return (
    <div
      className={cx(
        'may-input',
        `may-input--${size}`,
        isInvalid && 'may-input--invalid',
        isDisabled && 'may-input--disabled',
        fullWidth && 'may-input--full',
        wrapperClassName,
      )}
    >
      {prefix && (
        <span className="may-input__affix may-input__affix--prefix" aria-hidden>
          {prefix}
        </span>
      )}
      <input
        {...rest}
        ref={ref}
        id={id ?? field?.controlId}
        disabled={isDisabled}
        required={required ?? field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy ?? field?.describedBy}
        className={cx('may-input__control', className)}
      />
      {suffix && (
        <span className="may-input__affix may-input__affix--suffix" aria-hidden>
          {suffix}
        </span>
      )}
    </div>
  )
})
