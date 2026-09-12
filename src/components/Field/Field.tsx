import type { HTMLAttributes, ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'

/**
 * What a control inherits from the `<Field>` wrapped around it.
 *
 * The whole point of this object is that a consumer never types an `id`, an
 * `aria-describedby` or an `aria-invalid` by hand — three attributes that are
 * individually easy and collectively never all correct in real codebases.
 */
export interface FieldContextValue {
  /** The id the label points at. Controls must adopt it verbatim. */
  id: string
  /** id of the one visible message, for `aria-describedby`. */
  describedBy?: string
  /** True while `error` is set. Controls never decide this for themselves. */
  invalid: boolean
  required: boolean
  disabled: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * The surrounding `<Field>`, or `null` when a control is used bare.
 *
 * Returns null rather than throwing so every control can call it
 * unconditionally — a text input outside a Field is a legitimate thing.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

/** The subset of a control's props that a Field can supply for it. */
export interface FieldControlOwnProps {
  id?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  'aria-describedby'?: string
}

/**
 * Resolve one control's own props against the Field around it.
 *
 * A prop set explicitly on the control always wins — including `false`, so a
 * single control can opt out of a disabled Field. `aria-describedby` is the
 * exception and merges, because a control may point at its own hint *and* the
 * Field's message at once, and dropping either one loses information for a
 * screen reader.
 */
export function useFieldControl(own: FieldControlOwnProps = {}) {
  const field = useFieldContext()
  const describedBy = [own['aria-describedby'], field?.describedBy].filter(Boolean).join(' ')

  return {
    id: own.id ?? field?.id,
    invalid: own.invalid ?? field?.invalid ?? false,
    required: own.required ?? field?.required,
    disabled: own.disabled ?? field?.disabled,
    'aria-describedby': describedBy || undefined,
  }
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Exactly one form control. */
  children: ReactNode
  /** Visible label text. */
  label?: ReactNode
  /** Helper text under the control. Replaced by `error` while one is showing. */
  description?: ReactNode
  /** Error message. Its presence is what marks the control invalid. */
  error?: ReactNode
  /** Mark the field required, show the indicator, and set `required` on the control. */
  required?: boolean
  /** Mute the label and disable the control inside. */
  disabled?: boolean
  /** Override the generated control id — useful when a form library owns ids. */
  id?: string
}

/**
 * Label, description, error and the ARIA wiring that ties them to a control.
 *
 * This is the form primitive everything else leans on. Passing `error` is the
 * only way to mark a control invalid: the Field flips `aria-invalid`, swaps the
 * description for the message and points `aria-describedby` at it, so the
 * visual state and the announced state can never drift apart.
 *
 * The error *replaces* the description rather than stacking under it. Two
 * paragraphs of small print under a red field is where forms start to look
 * like a bug report; iOS shows one line at a time.
 *
 * `Input`, `Textarea` and `SearchField` adopt the generated id through context.
 * A bare `<input>` dropped in here does not, so give it `id` from `useFieldContext()`
 * or the label will point at nothing.
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
  ...rest
}: FieldProps) {
  const controlId = useAutoId(id)
  const invalid = Boolean(error)

  const message = invalid ? error : description
  const messageId = invalid ? `${controlId}-error` : description ? `${controlId}-description` : undefined

  const context = useMemo<FieldContextValue>(
    () => ({ id: controlId, describedBy: messageId, invalid, required, disabled }),
    [controlId, messageId, invalid, required, disabled],
  )

  return (
    <div
      {...rest}
      data-slot="field"
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-field', className)}
    >
      {label != null && (
        <label className="may-field__label" htmlFor={controlId}>
          {label}
          {required && (
            <span className="may-field__required" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <FieldContext.Provider value={context}>{children}</FieldContext.Provider>

      {message != null && message !== false && (
        <p
          id={messageId}
          className="may-field__message"
          data-kind={invalid ? 'error' : 'description'}
          /* Only the error is a live region — a description that announces
           * itself on every render is noise, not help. */
          role={invalid ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </div>
  )
}
