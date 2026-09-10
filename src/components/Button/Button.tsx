import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { renderAsChild } from '../../utils/asChild'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize, MayTone } from '../../types'
import './Button.css'

/**
 * `filled` for the one primary action, `tinted` for secondary (a wash of the
 * tint carrying tinted text), `gray` for neutral secondary, `plain` for
 * low-emphasis and toolbars.
 *
 * There is no `outline` variant. Nothing in this system is separated by a
 * stroke — a tinted fill does that job at every weight.
 */
export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children?: ReactNode
  /**
   * Render this button's presentation onto its child instead of a `<button>` —
   * the way to make a router `<Link>` look like a button without losing the
   * anchor. The child's own props win; `className` is merged. `type` and
   * `disabled` are not forwarded, because neither is valid on an `<a>`:
   * a disabled child gets `aria-disabled` instead.
   * @default false
   */
  asChild?: boolean
  /** @default 'filled' */
  variant?: ButtonVariant
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /** Pill instead of rounded-rect. iOS uses pills for prominent standalone actions. */
  pill?: boolean
  loading?: boolean
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

/**
 * The system's primary action control.
 *
 * Press feedback is asymmetric: down is 80ms and linear-ish so it beats the
 * eye, release rides a spring that overshoots past resting size and settles.
 * `usePressFeedback` holds the pressed state for a minimum window so a very
 * fast tap still shows the whole gesture.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    asChild = false,
    variant = 'filled',
    tone = 'tint',
    size = 'md',
    pill = false,
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading
  const { pressProps } = usePressFeedback(isDisabled)

  const inner = (content: ReactNode) => (
    <>
      {loading && <span className="may-button__spinner" aria-hidden />}
      {leadingIcon && !loading && (
        <span className="may-button__icon" aria-hidden>
          {leadingIcon}
        </span>
      )}
      {content != null && <span className="may-button__label">{content}</span>}
      {trailingIcon && (
        <span className="may-button__icon" aria-hidden>
          {trailingIcon}
        </span>
      )}
    </>
  )

  const presentation = {
    'data-slot': 'button',
    'data-variant': variant,
    'data-tone': tone,
    'data-size': size,
    'data-press-squish': 'true',
    className: cx(
      'may-button',
      'may-pressable',
      'may-hoverable',
      pill && 'may-button--pill',
      fullWidth && 'may-button--full',
      className,
    ),
  }

  if (asChild) {
    return renderAsChild(
      children,
      {
        ...rest,
        ...pressProps,
        ref,
        ...presentation,
        'aria-busy': loading || undefined,
        // `disabled` is not a thing on an anchor; announce it instead.
        'aria-disabled': isDisabled || undefined,
      },
      inner,
    )
  }

  return (
    <button
      {...rest}
      {...pressProps}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...presentation}
    >
      {inner(children)}
    </button>
  )
})
