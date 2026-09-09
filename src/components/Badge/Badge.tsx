import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import type { MayTone } from '../../types'
import './Badge.css'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
  /** @default 'neutral' */
  tone?: MayTone
  /** @default 'soft' */
  variant?: 'soft' | 'solid' | 'outline'
  /** @default 'md' */
  size?: 'sm' | 'md'
  /** Show a filled dot before the label. @default false */
  dot?: boolean
}

/** A small status label. Read-only — use `<Tag>` when it can be removed. */
export function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={cx(
        'may-badge',
        `may-badge--${variant}`,
        `may-badge--tone-${tone}`,
        `may-badge--${size}`,
        className,
      )}
    >
      {dot && <span className="may-badge__dot" aria-hidden />}
      {children}
    </span>
  )
}
