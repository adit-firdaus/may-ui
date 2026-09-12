import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'

export type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right'

export interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which edges to hold clear of the notch, the home indicator and the rounded
   * corners. @default all four
   */
  edges?: SafeAreaEdge | SafeAreaEdge[]
}

const ALL_EDGES: SafeAreaEdge[] = ['top', 'bottom', 'left', 'right']

/**
 * Padding that matches the hardware.
 *
 * Deliberately hook-free: reading insets in JavaScript means a first paint at
 * the wrong size and a reflow once the effect runs, and it misses the moment a
 * phone rotates. CSS knows the value before the first frame, so this is a
 * `<div>` with padding and nothing else.
 *
 * With children it pads them; empty it is a spacer of exactly the inset's
 * height — the bar you put under a tab bar so the last row clears the home
 * indicator.
 */
export const SafeArea = forwardRef<HTMLDivElement, SafeAreaProps>(function SafeArea(
  { edges = ALL_EDGES, className, children, ...rest },
  ref,
) {
  const list = Array.isArray(edges) ? edges : [edges]

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="safe-area"
      // Space-separated so CSS can ask for one edge with [data-edges~='top'],
      // which keeps the four rules independent of the order they were listed.
      data-edges={list.join(' ')}
      // An empty spacer is furniture; announcing it would be noise.
      aria-hidden={children == null ? true : undefined}
      className={cx('may-safe-area', className)}
    >
      {children}
    </div>
  )
})
