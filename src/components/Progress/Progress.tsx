import type { HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { MayTone } from '../../types'
import './Progress.css'

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value. Omit for an indeterminate bar. */
  value?: number
  /** @default 100 */
  max?: number
  /** @default 'brand' */
  tone?: MayTone
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Print the percentage beside the bar. @default false */
  showValue?: boolean
  /** Accessible name — required when there is no visible label nearby. */
  'aria-label'?: string
}

/** A determinate or indeterminate progress bar. */
export function Progress({
  value,
  max = 100,
  tone = 'brand',
  size = 'md',
  showValue = false,
  className,
  ...rest
}: ProgressProps) {
  const indeterminate = value === undefined
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? (clamped / max) * 100 : 0

  return (
    <div className={cx('may-progress', `may-progress--${size}`, className)}>
      <div
        {...rest}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={cx(
          'may-progress__track',
          `may-progress__track--tone-${tone}`,
          indeterminate && 'may-progress__track--indeterminate',
        )}
      >
        <div
          className="may-progress__bar"
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
      {showValue && !indeterminate && (
        <span className="may-progress__value">{Math.round(percent)}%</span>
      )}
    </div>
  )
}
