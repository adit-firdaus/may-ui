import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './ButtonGroup.css'

export interface ButtonGroupProps {
  /** `Button` or `IconButton` children. */
  children?: ReactNode
  /** Join the buttons into one segmented control. @default true */
  attached?: boolean
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  className?: string
  /** Names the group for assistive tech. */
  'aria-label'?: string
}

/** Groups related buttons, optionally joining them into a segmented control. */
export function ButtonGroup({
  children,
  attached = true,
  orientation = 'horizontal',
  className,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      {...rest}
      role="group"
      className={cx(
        'may-button-group',
        `may-button-group--${orientation}`,
        attached && 'may-button-group--attached',
        className,
      )}
    >
      {children}
    </div>
  )
}
