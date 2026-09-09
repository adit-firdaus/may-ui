import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import type { MayTone } from '../../types'
import './Tag.css'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
  /** @default 'neutral' */
  tone?: MayTone
  /** @default 'md' */
  size?: 'sm' | 'md'
  /** When provided, renders a remove button that calls this. */
  onRemove?: () => void
  /** Accessible name for the remove button. @default 'Remove' */
  removeLabel?: string
  /** Icon or avatar shown before the label. */
  leadingIcon?: ReactNode
}

/** A removable chip, typically representing a filter or a selected value. */
export function Tag({
  children,
  tone = 'neutral',
  size = 'md',
  onRemove,
  removeLabel = 'Remove',
  leadingIcon,
  className,
  ...rest
}: TagProps) {
  return (
    <span
      {...rest}
      className={cx('may-tag', `may-tag--tone-${tone}`, `may-tag--${size}`, className)}
    >
      {leadingIcon && (
        <span className="may-tag__icon" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <span className="may-tag__label">{children}</span>
      {onRemove && (
        <button type="button" className="may-tag__remove" onClick={onRemove} aria-label={removeLabel}>
          <svg viewBox="0 0 16 16" aria-hidden focusable="false">
            <path
              d="M4.5 4.5l7 7M11.5 4.5l-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
