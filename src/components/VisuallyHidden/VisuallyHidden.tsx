import type { HTMLAttributes, Ref } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import './VisuallyHidden.css'

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /**
   * `span` by default so it can sit inside a button's label without breaking
   * the flow. Use `div` when the hidden text is a block of its own.
   * @default 'span'
   */
  as?: 'span' | 'div'
  /**
   * Reveal the element while anything inside it has focus. Required whenever
   * the content is focusable — a "Skip to content" link that stays invisible
   * when tabbed to has moved the keyboard user somewhere they cannot see.
   */
  focusable?: boolean
}

/**
 * Text for screen readers only.
 *
 * Not `display: none` and not `visibility: hidden` — both remove the element
 * from the accessibility tree along with the layout, which is the opposite of
 * what is wanted. The clip technique in `.may-sr-only` leaves it announced.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as = 'span', focusable = false, className, children, ...rest },
  ref,
) {
  const Component = as

  return (
    <Component
      {...rest}
      // Both branches of the union are HTML elements; the ref type is widened
      // to HTMLElement because `as` decides which one at the call site.
      ref={ref as Ref<HTMLSpanElement & HTMLDivElement>}
      data-slot="visually-hidden"
      className={cx(
        'may-sr-only',
        'may-visually-hidden',
        focusable && 'may-visually-hidden--focusable',
        className,
      )}
    >
      {children}
    </Component>
  )
})
