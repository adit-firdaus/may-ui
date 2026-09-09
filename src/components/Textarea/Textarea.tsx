import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldContext } from '../Field/Field'
import type { MaySize } from '../../types'
import './Textarea.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** @default 'md' */
  size?: MaySize
  invalid?: boolean
  /** @default false */
  fullWidth?: boolean
  /** Visible rows. @default 4 */
  rows?: number
  /** Allow the user to drag-resize. @default 'vertical' */
  resize?: 'none' | 'vertical' | 'both'
}

/** Multi-line text control. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    rows = 4,
    resize = 'vertical',
    className,
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
    <textarea
      {...rest}
      ref={ref}
      rows={rows}
      id={id ?? field?.controlId}
      disabled={isDisabled}
      required={required ?? field?.required}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy ?? field?.describedBy}
      className={cx(
        'may-textarea',
        `may-textarea--${size}`,
        isInvalid && 'may-textarea--invalid',
        fullWidth && 'may-textarea--full',
        `may-textarea--resize-${resize}`,
        className,
      )}
    />
  )
})
