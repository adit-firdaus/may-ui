import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from 'react'
import { forwardRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useFieldControl } from '../Field/Field'
import type { MaySize } from '../../types'
import './Select.css'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> {
  /** @default 'md' */
  size?: MaySize
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  /** @default false */
  fullWidth?: boolean
  /** Options to render. Pass `<option>` / `<optgroup>` children instead when you need groups. */
  options?: SelectOption[]
  /** A disabled first option, shown until something is picked. */
  placeholder?: string
  /** Convenience over `onChange` — receives the value alone. */
  onValueChange?: (value: string) => void
  children?: ReactNode
}

/**
 * A single-choice picker.
 *
 * The element is a real `<select>`, so it opens the platform picker — the iOS
 * wheel, the Mac menu — announces itself correctly, and works with autofill and
 * form submission. The wrapper only paints: a translucent fill and a chevron,
 * never a boxed field with a stroke around it.
 *
 * Everything the surrounding `<Field>` knows — the id its label points at, the
 * id of its message, whether it is required, disabled or in error — arrives
 * through context, so none of those four attributes is ever typed by hand at
 * the call site. An explicit prop still wins, including `false`, so one control
 * can opt out of a disabled Field.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    options,
    placeholder,
    onValueChange,
    children,
    className,
    disabled,
    required,
    id,
    value,
    defaultValue,
    onChange,
    'aria-describedby': describedBy,
    style,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, required, disabled, 'aria-describedby': describedBy })
  const isDisabled = Boolean(field.disabled)
  const { pressProps } = usePressFeedback(isDisabled)

  // Tracked only so the placeholder can be greyed while it is showing; the
  // native element remains the source of truth for the value itself.
  const [innerValue, setInnerValue] = useState(() =>
    defaultValue !== undefined ? String(defaultValue) : '',
  )
  const currentValue = value !== undefined ? String(value) : innerValue
  const showingPlaceholder = Boolean(placeholder) && currentValue === ''

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (value === undefined) setInnerValue(event.target.value)
    onValueChange?.(event.target.value)
    onChange?.(event)
  }

  return (
    <div
      {...pressProps}
      data-slot="select"
      data-size={size}
      data-invalid={field.invalid ? 'true' : undefined}
      data-placeholder={showingPlaceholder ? 'true' : undefined}
      /* aria-disabled, not just the input's `disabled`: base.css gates its
       * shared hover highlight on exactly this attribute, so a disabled fill
       * that skipped it would still light up under a mouse. */
      aria-disabled={isDisabled || undefined}
      className={cx(
        'may-select',
        'may-pressable',
        'may-hoverable',
        fullWidth && 'may-select--full',
        className,
      )}
      style={style}
    >
      <select
        {...rest}
        ref={ref}
        id={field.id}
        className="may-select__native"
        disabled={isDisabled}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field['aria-describedby']}
        onChange={handleChange}
        {...(value !== undefined
          ? { value }
          : // An empty default is what keeps the placeholder selected on mount.
            { defaultValue: defaultValue ?? (placeholder ? '' : undefined) })}
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
      {/* chevron.up.chevron.down — iOS's own glyph for "this opens a menu". */}
      <svg className="may-select__chevron" viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M4.75 6.25L8 3L11.25 6.25M4.75 9.75L8 13L11.25 9.75"
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
