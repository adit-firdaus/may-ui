import type { HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { MaySize } from '../../types'
import './Spinner.css'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default 'md' */
  size?: MaySize
  /**
   * Accessible label announced while loading. Pass `null` for a purely
   * decorative spinner sitting next to its own visible text.
   * @default 'Loading'
   */
  label?: string | null
}

/** Indeterminate activity indicator. */
export function Spinner({ size = 'md', label = 'Loading', className, ...rest }: SpinnerProps) {
  return (
    <span
      {...rest}
      role={label ? 'status' : undefined}
      className={cx('may-spinner', `may-spinner--${size}`, className)}
    >
      <span className="may-spinner__circle" />
      {label && <span className="may-sr-only">{label}</span>}
    </span>
  )
}
