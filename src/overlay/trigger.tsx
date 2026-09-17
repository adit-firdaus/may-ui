import { cloneElement, isValidElement } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

/** Props an overlay injects into whatever element it is handed as a trigger. */
export interface OverlayTriggerProps {
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
  'aria-haspopup'?: 'dialog' | 'menu' | 'listbox'
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export interface OverlayTriggerOptions {
  open: boolean
  onToggle: (event: ReactMouseEvent<HTMLElement>) => void
  /** What the trigger advertises it opens. @default 'dialog' */
  haspopup?: 'dialog' | 'menu' | 'listbox'
  /** The surface's id, while it exists. */
  controls?: string
  /** Class for the fallback button only. */
  className?: string
}

/**
 * Turn whatever the consumer passed as `trigger` into a real control.
 *
 * A React element is cloned so the open state lands on the control the consumer
 * actually styled, and its own `onClick` is called first — a trigger that
 * silently dropped the handler you put on it would be a trap. Anything else
 * (a string, a number) is wrapped in a plain button, because a surface you
 * cannot reach from the keyboard is not a surface.
 *
 * This is Popover's mechanism, lifted rather than reimplemented: it already
 * carried the cloning, the handler chaining and the fallback, and five more
 * overlays needing the same thing is how a codebase ends up with five subtly
 * different triggers.
 */
export function overlayTrigger(
  trigger: ReactNode,
  { open, onToggle, haspopup = 'dialog', controls, className }: OverlayTriggerOptions,
): ReactNode {
  const injected: OverlayTriggerProps = {
    'aria-haspopup': haspopup,
    'aria-expanded': open,
    'aria-controls': controls,
  }

  if (isValidElement<OverlayTriggerProps>(trigger)) {
    return cloneElement(trigger, {
      ...injected,
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        trigger.props.onClick?.(event)
        onToggle(event)
      },
    })
  }

  return (
    <button type="button" {...injected} onClick={onToggle} className={className}>
      {trigger}
    </button>
  )
}
