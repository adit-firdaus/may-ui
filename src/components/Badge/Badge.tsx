import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { duration, resolveCurve, spring } from '../../motion/springs'
import type { MaySize, MayTone } from '../../types'

/**
 * `tinted` is a wash of the tone carrying tone-coloured text — the weight iOS
 * uses inline next to a label. `solid` is the tone as a fill, for the one
 * badge on screen that has to be seen from across the room.
 */
export type BadgeVariant = 'tinted' | 'solid'

/** A badge annotates something else, so it never reaches the `lg` control rung's neighbour `xs`. */
export type BadgeSize = Exclude<MaySize, 'xs'>

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  children?: ReactNode
  /** @default 'tinted' */
  variant?: BadgeVariant
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'sm' */
  size?: BadgeSize
  /** Leading status dot. With no label the badge collapses to the dot alone. */
  dot?: boolean
  /**
   * Notification-count shape: circular at one digit, growing into a pill as
   * digits are added. Takes precedence over `children`.
   */
  count?: number
  /** Counts above this render as `${max}+`. @default 99 */
  max?: number
}

/**
 * A status pill.
 *
 * The count shape is the interesting one. iOS badges *pop* when the number
 * changes — the badge jumps oversized and springs back — and that motion is
 * how you notice a count moved without watching for it. It is driven from a
 * ref rather than a CSS class because a class-toggle cannot restart an
 * animation that is already at rest without a second frame of bookkeeping.
 */
export function Badge({
  children,
  variant = 'tinted',
  tone = 'tint',
  size = 'sm',
  dot = false,
  count,
  max = 99,
  className,
  'aria-label': ariaLabel,
  ...rest
}: BadgeProps) {
  const isCount = count !== undefined
  const dotOnly = dot && !isCount && children == null
  /*
   * A dot-only badge renders an empty span. `aria-label` is PROHIBITED on a
   * generic element — a nameless role cannot take a name, and axe flags it as
   * a serious aria-prohibited-attr failure — so the label was being dropped by
   * the very readers it was written for. `img` is the role for a graphic that
   * carries meaning through a text alternative, which is exactly what a
   * coloured dot labelled "Unread" is.
   */
  const named = dotOnly && ariaLabel !== undefined
  const rootRef = useRef<HTMLSpanElement>(null)
  const previousCount = useRef(count)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = rootRef.current
    if (count === undefined || previousCount.current === count) return
    previousCount.current = count
    // A pop the user did not ask for is noise, so it only ever plays on a
    // change — never on first paint, and never under reduced motion.
    if (!el || reducedMotion || typeof el.animate !== 'function') return
    el.animate([{ transform: 'scale(1.34)' }, { transform: 'scale(1)' }], {
      duration: duration.settle,
      // The spring overshoots past 1, so the badge settles with a second,
      // smaller bounce — the same curve every press in the system rides.
      easing: resolveCurve(el, spring('bouncy')),
    })
  }, [count, reducedMotion])

  return (
    <span
      {...rest}
      ref={rootRef}
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-shape={isCount ? 'count' : undefined}
      role={named ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cx(
        'may-badge',
        isCount && 'may-badge--count',
        dotOnly && 'may-badge--dot-only',
        className,
      )}
    >
      {dot && !dotOnly && !isCount && <span className="may-badge__dot" aria-hidden />}
      {isCount ? (count > max ? `${max}+` : count) : children}
    </span>
  )
}
