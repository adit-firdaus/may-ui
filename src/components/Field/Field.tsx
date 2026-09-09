import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Field.css'

export interface FieldContextValue {
  /** id to put on the control */
  controlId: string
  /** value for the control's `aria-describedby` */
  describedBy?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * Read the surrounding `<Field>`. Returns `null` when the control is used
 * standalone, so every control stays usable outside a Field.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

export interface FieldProps {
  /** Exactly one form control. */
  children: ReactNode
  /** Visible label text. */
  label?: ReactNode
  /** Helper text under the control. Hidden while `error` is showing. */
  description?: ReactNode
  /** Error message. Its presence marks the control invalid. */
  error?: ReactNode
  /** Mark the field required and show the required indicator. @default false */
  required?: boolean
  /** Disable the label styling; also forwarded to the control. @default false */
  disabled?: boolean
  /** Override the generated control id. */
  id?: string
  className?: string
}

/**
 * Labels a form control and owns its help text, error message and
 * `aria-describedby` wiring. Wrap every control in one.
 */
export function Field({
  children,
  label,
  description,
  error,
  required = false,
  disabled = false,
  id,
  className,
}: FieldProps) {
  const controlId = useAutoId(id)
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const invalid = Boolean(error)

  const value = useMemo<FieldContextValue>(
    () => ({
      controlId,
      describedBy:
        cx(description && !invalid ? descriptionId : '', invalid ? errorId : '').trim() ||
        undefined,
      invalid,
      required,
      disabled,
    }),
    [controlId, description, descriptionId, errorId, invalid, required, disabled],
  )

  return (
    <FieldContext.Provider value={value}>
      <div className={cx('may-field', disabled && 'may-field--disabled', className)}>
        {label && (
          <label className="may-field__label" htmlFor={controlId}>
            {label}
            {required && (
              <span className="may-field__required" aria-hidden>
                *
              </span>
            )}
          </label>
        )}
        {children}
        {invalid ? (
          <p className="may-field__error" id={errorId}>
            {error}
          </p>
        ) : (
          description && (
            <p className="may-field__description" id={descriptionId}>
              {description}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  )
}
