import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Divider.css'

export interface DividerProps {
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Optional centred label; horizontal dividers only. */
  children?: ReactNode
  className?: string
}

/** A rule between sections, optionally carrying a label. */
export function Divider({ orientation = 'horizontal', children, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cx('may-divider', 'may-divider--vertical', className)}
      />
    )
  }

  if (children) {
    return (
      <div role="separator" className={cx('may-divider-labelled', className)}>
        <span className="may-divider-labelled__line" />
        <span className="may-divider-labelled__label">{children}</span>
        <span className="may-divider-labelled__line" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cx('may-divider', 'may-divider--horizontal', className)}
    />
  )
}
