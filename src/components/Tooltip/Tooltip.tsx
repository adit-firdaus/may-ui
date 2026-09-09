import type { ReactElement, ReactNode } from 'react'
import { cloneElement, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Tooltip.css'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** The trigger. Must be a single element that accepts a ref and handlers. */
  children: ReactElement
  /** Tooltip content. Keep it short — it is not focusable. */
  content: ReactNode
  /** @default 'top' */
  placement?: TooltipPlacement
  /** Delay before showing, in ms. @default 150 */
  delay?: number
  /** Force the open state, e.g. for a story or a test. */
  open?: boolean
  className?: string
}

/**
 * A short hint shown on hover or focus. Content is exposed via
 * `aria-describedby`, so never put an action or essential-only info inside.
 */
export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 150,
  open,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useAutoId()
  const isOpen = open ?? visible

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(true), delay)
  }
  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(false)
  }

  const trigger = cloneElement(children, {
    'aria-describedby': isOpen ? id : undefined,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  } as Partial<Record<string, unknown>>)

  return (
    <span className={cx('may-tooltip', className)}>
      {trigger}
      <span
        role="tooltip"
        id={id}
        className={cx(
          'may-tooltip__bubble',
          `may-tooltip__bubble--${placement}`,
          isOpen && 'may-tooltip__bubble--visible',
        )}
      >
        {content}
      </span>
    </span>
  )
}
