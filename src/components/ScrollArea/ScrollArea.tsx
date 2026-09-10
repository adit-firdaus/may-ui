import type { CSSProperties, HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import './ScrollArea.css'

export type ScrollAxis = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Height at which the region starts scrolling. A number is read as px. */
  maxHeight?: number | string
  /** @default 'vertical' */
  axis?: ScrollAxis
}

/**
 * A scrollable region.
 *
 * There is no custom scrollbar here, and that is the point: `data-slot`
 * wires the region into the one set of rules in base.css that thins the native
 * scrollbar, insets its thumb and — the part that matters on a phone —
 * contains overscroll, so reaching the end of this list does not start
 * rubber-banding the page behind it. A JS scrollbar would cost a listener per
 * frame to reproduce something the platform already does correctly.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { maxHeight, axis = 'vertical', className, style, children, ...rest },
  ref,
) {
  const vars: Record<string, string> = {}
  if (maxHeight !== undefined) {
    vars['--may-scroll-max'] = typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight)
  }

  return (
    <div
      // A region that scrolls has to be reachable by keyboard, and only Firefox
      // focuses overflow containers on its own. Declared before the spread so a
      // consumer can still take it out of the tab order.
      tabIndex={0}
      {...rest}
      ref={ref}
      data-slot="scroll-area"
      data-axis={axis}
      className={cx('may-scroll-area', className)}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </div>
  )
})
