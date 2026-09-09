import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import type { MaySpace } from '../Box/Box'
import './Stack.css'

export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

export interface StackProps {
  children?: ReactNode
  as?: ElementType
  /** Layout axis. @default 'vertical' */
  direction?: 'vertical' | 'horizontal'
  /** Gap between children, in spacing steps. @default 4 */
  gap?: MaySpace
  /** Cross-axis alignment. @default 'stretch' for vertical, 'center' for horizontal */
  align?: StackAlign
  /** Main-axis distribution. @default 'start' */
  justify?: StackJustify
  /** Allow children to wrap onto more lines. @default false */
  wrap?: boolean
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

const alignMap: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyMap: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
}

/**
 * One-dimensional layout. The default way to space anything in May UI —
 * reach for it before writing a flex rule by hand.
 */
export function Stack({
  children,
  as: Tag = 'div',
  direction = 'vertical',
  gap = 4,
  align,
  justify = 'start',
  wrap = false,
  fullWidth = false,
  className,
  style,
}: StackProps) {
  const resolvedAlign = align ?? (direction === 'horizontal' ? 'center' : 'stretch')
  return (
    <Tag
      className={cx('may-stack', fullWidth && 'may-stack--full', className)}
      style={
        {
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: `var(--may-space-${gap})`,
          alignItems: alignMap[resolvedAlign],
          justifyContent: justifyMap[justify],
          flexWrap: wrap ? 'wrap' : undefined,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
