import type { LabelHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MayTextStyle } from '../../types'
import type { TextTone, TextWeight } from '../Text/Text'
// Value import: Label renders with Text's `.may-text` classes, and a type-only
// import is erased at compile time — Storybook then code-splits the scale away
// and the label renders unstyled.

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'color'> {
  children?: ReactNode
  /** Id of the control this labels. */
  htmlFor?: string
  /** Adds the required marker, plus the word itself for assistive tech. */
  required?: boolean
  /** Dims to match a disabled control, and stops clicks reaching it. */
  disabled?: boolean
  /** @default 'subheadline' */
  variant?: MayTextStyle
  /** @default 'default' */
  tone?: TextTone
  /** @default 'medium' */
  weight?: TextWeight
  /**
   * The iOS grouped-form eyebrow: uppercase, tracked out, secondary — what
   * Settings uses above a section rather than beside a field.
   */
  uppercase?: boolean
}

/**
 * A form label.
 *
 * Always a real `<label>` with `htmlFor`, because the association is what makes
 * the label a second, much larger hit target for its control — an ARIA label
 * reads the same to a screen reader and gives a shaking hand nothing to aim at.
 *
 * The required marker is decorative: the asterisk is `aria-hidden` and the word
 * "required" rides along in the accessible name, so nobody has to know what a
 * red star means.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  {
    children,
    htmlFor,
    required = false,
    disabled = false,
    variant = 'subheadline',
    tone = 'default',
    weight = 'medium',
    uppercase = false,
    className,
    ...rest
  },
  ref,
) {
  return (
    <label
      {...rest}
      ref={ref}
      htmlFor={htmlFor}
      data-slot="label"
      data-variant={variant}
      data-tone={tone}
      data-weight={weight}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-text', 'may-label', uppercase && 'may-label--eyebrow', className)}
    >
      {children}
      {required && (
        <>
          <span className="may-label__required" aria-hidden>
            *
          </span>
          <span className="may-sr-only">(required)</span>
        </>
      )}
    </label>
  )
})
