import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { Spinner } from '../Spinner/Spinner'
import type { MaySize, MayTone } from '../../types'
import './Button.css'

/**
 * `solid` for the one primary action on a view, `outline` for secondary,
 * `soft` for tinted secondary actions, `ghost` for low-emphasis and toolbars,
 * `link` for inline navigation.
 */
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children?: ReactNode
  /** @default 'solid' */
  variant?: ButtonVariant
  /** @default 'brand' */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /** Show a spinner and block interaction. @default false */
  loading?: boolean
  /** Stretch to the full width of the parent. @default false */
  fullWidth?: boolean
  /** Icon placed before the label. */
  leadingIcon?: ReactNode
  /** Icon placed after the label. */
  trailingIcon?: ReactNode
}

/** The system's primary action control. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'solid',
    tone = 'brand',
    size = 'md',
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
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        'may-button',
        `may-button--${variant}`,
        `may-button--tone-${tone}`,
        `may-button--${size}`,
        fullWidth && 'may-button--full',
        loading && 'may-button--loading',
        className,
      )}
    >
      {loading && <Spinner className="may-button__spinner" size={size} aria-hidden />}
      {leadingIcon && !loading && (
        <span className="may-button__icon" aria-hidden>
          {leadingIcon}
        </span>
      )}
      {children != null && <span className="may-button__label">{children}</span>}
      {trailingIcon && (
        <span className="may-button__icon" aria-hidden>
          {trailingIcon}
        </span>
      )}
    </button>
  )
})
