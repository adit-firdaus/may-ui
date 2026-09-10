import type { CSSProperties, HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MaySpaceStep } from '../Box/Box'
import './Grid.css'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed number of equal columns. @default 1 */
  columns?: number
  /**
   * Narrowest a column may get before the grid drops one. Set this instead of
   * `columns` for content that should reflow — an app-icon wall, a photo grid
   * — and the column count follows the container with no media queries and no
   * resize listener. A number is read as px.
   */
  minColumnWidth?: number | string
  /** Gap as a step on the 4px scale. @default 0 */
  gap?: MaySpaceStep
}

const space = (step: MaySpaceStep) => `var(--may-space-${step})`

/**
 * A two-axis grid, in the two shapes that actually get used: a fixed number of
 * equal columns, or as many columns as fit at a given minimum width.
 *
 * `minColumnWidth` wins when both are given, because a responsive floor and a
 * fixed count contradict each other and the responsive answer is the one that
 * cannot overflow the container.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 1, minColumnWidth, gap = 0, className, style, children, ...rest },
  ref,
) {
  const autoFill = minColumnWidth !== undefined

  const vars: Record<string, string> = { '--may-grid-gap': space(gap) }
  if (autoFill) {
    vars['--may-grid-min'] =
      typeof minColumnWidth === 'number' ? `${minColumnWidth}px` : String(minColumnWidth)
  } else {
    vars['--may-grid-columns'] = String(columns)
  }

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="grid"
      data-auto-fill={autoFill ? 'true' : undefined}
      className={cx('may-grid', className)}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </div>
  )
})
