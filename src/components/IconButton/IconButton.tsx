import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { Spinner } from '../Spinner/Spinner'
import type { ButtonVariant } from '../Button/Button'
import type { MaySize, MayTone } from '../../types'
// IconButton renders with Button's variant/tone classes (.may-button--*), which
// live in Button.css. The type-only ButtonVariant import above is erased at compile,
// so this value import is what guarantees those rules load wherever IconButton is used.
import '../Button/Button.css'
import './IconButton.css'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> {
  /** The icon to render. */
  icon: ReactNode
  /** Required: there is no visible text to name this control. */
  'aria-label': string
  /** @default 'ghost' */
  variant?: Exclude<ButtonVariant, 'link'>
  /** @default 'neutral' */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /** @default false */
  loading?: boolean
  /** Render fully round instead of rounded-rectangle. @default false */
  round?: boolean
}

/** A square button carrying only an icon. Always needs an `aria-label`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    variant = 'ghost',
    tone = 'neutral',
    size = 'md',
    loading = false,
    round = false,
    disabled,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'may-button',
        'may-icon-button',
        `may-button--${variant}`,
        `may-button--tone-${tone}`,
        `may-icon-button--${size}`,
        round && 'may-icon-button--round',
        className,
      )}
    >
      {loading ? <Spinner size={size} label={null} aria-hidden /> : icon}
    </button>
  )
})
