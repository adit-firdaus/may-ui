import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import type { MaySpace } from '../Box/Box'
import './Grid.css'

export interface GridProps {
  children?: ReactNode
  as?: ElementType
  /** Fixed column count. Ignored when `minColumnWidth` is set. @default 2 */
  columns?: number
  /**
   * Responsive mode: fit as many columns as will hold this minimum width
   * (e.g. `'220px'`). Takes precedence over `columns`.
   */
  minColumnWidth?: string
  /** Gap between cells, in spacing steps. @default 4 */
  gap?: MaySpace
  className?: string
  style?: CSSProperties
}

/** Two-dimensional layout for card grids and form rows. */
export function Grid({
  children,
  as: Tag = 'div',
  columns = 2,
  minColumnWidth,
  gap = 4,
  className,
  style,
}: GridProps) {
  return (
    <Tag
      className={cx('may-grid', className)}
      style={
        {
          gridTemplateColumns: minColumnWidth
            ? `repeat(auto-fill, minmax(${minColumnWidth}, 1fr))`
            : `repeat(${columns}, minmax(0, 1fr))`,
          gap: `var(--may-space-${gap})`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
