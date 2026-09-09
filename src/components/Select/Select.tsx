import type { ReactNode, SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldContext } from '../Field/Field'
import type { MaySize } from '../../types'
import './Select.css'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** @default 'md' */
  size?: MaySize
  invalid?: boolean
  /** @default false */
  fullWidth?: boolean
  /** Options to render. Omit and pass `<option>` children instead if you prefer. */
  options?: SelectOption[]
  /** Renders a disabled, selected-by-default first option. */
  placeholder?: string
  children?: ReactNode
}

/** Native single-select, styled to match the rest of the system. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    options,
    placeholder,
    children,
    className,
    disabled,
    required,
    id,
    defaultValue,
    value,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false
  const isDisabled = disabled ?? field?.disabled ?? false
  const uncontrolledDefault =
    value === undefined && defaultValue === undefined && placeholder ? '' : defaultValue

  return (
    <div
      className={cx(
        'may-select',
        `may-select--${size}`,
        isInvalid && 'may-select--invalid',
        isDisabled && 'may-select--disabled',
        fullWidth && 'may-select--full',
      )}
    >
      <select
        {...rest}
        ref={ref}
        id={id ?? field?.controlId}
        value={value}
        defaultValue={uncontrolledDefault}
        disabled={isDisabled}
        required={required ?? field?.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy ?? field?.describedBy}
        className={cx('may-select__control', className)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <svg className="may-select__chevron" viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
})
