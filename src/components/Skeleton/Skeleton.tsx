import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Skeleton.css'

export type SkeletonVariant = 'text' | 'block' | 'circle'

/** Named radius tokens only — a placeholder must match the shape it stands in for. */
export type SkeletonRadius = 'xs' | 'sm' | 'md' | 'lg' | 'card' | 'full'

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** @default 'text' */
  variant?: SkeletonVariant
  /** Number of bars, `text` only. The last one is short, the way a paragraph ends. @default 1 */
  lines?: number
  /** Numbers are pixels; strings pass through, so `'60%'` and `'12ch'` work. */
  width?: number | string
  /** For `text` this is the height of each BAR, not of the stack. */
  height?: number | string
  /** Overrides the per-variant default. */
  radius?: SkeletonRadius
  /**
   * Announced while the placeholder is up, e.g. "Loading messages". Without it
   * the skeleton is hidden from assistive tech entirely — which is correct,
   * because a screen reader has nothing to gain from a description of a grey
   * rectangle, but it does mean a silent screen unless something else speaks.
   */
  label?: string
}

const toLength = (value?: number | string) =>
  typeof value === 'number' ? `${value}px` : value

/**
 * The shape of content that has not arrived yet.
 *
 * A placeholder only works if it is the same silhouette as the thing it
 * replaces, so the API is deliberately geometric — variant, line count, width,
 * height — rather than a set of named presets that would drift from the real
 * layouts.
 *
 * The shimmer is a gradient sweeping across a fill from the same ramp as the
 * base, which is why there is no per-theme override: layering fill on fill
 * darkens on white and lightens on black, so the band always moves toward
 * contrast in whichever direction the theme has.
 */
export function Skeleton({
  variant = 'text',
  lines = 1,
  width,
  height,
  radius,
  label,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const isText = variant === 'text'
  const count = isText ? Math.max(1, Math.round(lines)) : 0

  const vars = {
    ...style,
    width: toLength(width),
    // For text the height belongs to each bar; the stack's own height is the
    // sum of the bars and the gaps between them and must stay derived.
    ...(isText ? { '--may-skeleton-line-h': toLength(height) } : { height: toLength(height) }),
    ...(radius ? { '--may-skeleton-radius': `var(--may-radius-${radius})` } : null),
  } as CSSProperties

  return (
    <div
      {...rest}
      data-slot="skeleton"
      data-variant={variant}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className={cx('may-skeleton', className)}
      style={vars}
    >
      {isText &&
        Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className="may-skeleton__line"
            // Only a real paragraph has a short last line; a single bar is a
            // label, and cutting that to 60% just looks like a mistake.
            data-tail={count > 1 && index === count - 1 ? 'true' : undefined}
          />
        ))}
      {label && <span className="may-sr-only">{label}</span>}
    </div>
  )
}
