import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Skeleton.css'

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** @default 'block' */
  variant?: 'text' | 'block' | 'circle'
  /** CSS width, e.g. `'100%'` or `'12rem'`. */
  width?: string
  /** CSS height. Ignored for `text`, which uses the line height. */
  height?: string
  /** Number of stacked lines. `text` only. @default 1 */
  lines?: number
  /** Turn off the shimmer. @default false */
  static?: boolean
}

/** A loading placeholder shaped like the content it stands in for. */
export function Skeleton({
  variant = 'block',
  width,
  height,
  lines = 1,
  static: isStatic = false,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const base = cx(
    'may-skeleton',
    `may-skeleton--${variant}`,
    isStatic && 'may-skeleton--static',
    className,
  )

  if (variant === 'text' && lines > 1) {
    return (
      <div className="may-skeleton-lines" aria-hidden {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={base}
            style={{ width: i === lines - 1 ? '65%' : width ?? '100%', ...style } as CSSProperties}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      {...rest}
      aria-hidden
      className={base}
      style={{ width, height, ...style } as CSSProperties}
    />
  )
}
