import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './ButtonGroup.css'

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Join the children into one cluster with a shared outer radius. Turn it off
   * for a plain row of separate buttons with a normal gap.
   * @default true
   */
  attached?: boolean
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Children divide the group's width (or its width, when vertical) equally. */
  fullWidth?: boolean
}

/**
 * A cluster of related actions.
 *
 * Attached children are separated by a hairline-wide **gap**, not a stroke —
 * the surface behind the group shows through it, exactly the way an iOS alert
 * divides its actions. That keeps the divider correct on any background, and
 * keeps the system's "nothing is separated by a line" rule intact.
 *
 * The press is handled at the cluster, not the child: see the note in the CSS.
 */
export function ButtonGroup({
  children,
  attached = true,
  orientation = 'horizontal',
  fullWidth = false,
  className,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      {...rest}
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      data-attached={attached ? 'true' : 'false'}
      className={cx('may-button-group', fullWidth && 'may-button-group--full', className)}
    >
      {children}
    </div>
  )
}
