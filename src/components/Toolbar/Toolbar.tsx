import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useRef } from 'react'
import { cx } from '../../utils/cx'

/** What the arrow keys are allowed to move between. */
const FOCUSABLE =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]):not([disabled])'

/**
 * Controls that own the arrow keys themselves. A segmented control moves its
 * own selection with them and a text field moves its caret; the bar must not
 * steal either.
 */
const OWNS_ARROWS =
  'input, textarea, select, [contenteditable="true"], [role="tablist"], [role="slider"], [role="radiogroup"], [role="listbox"]'

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Which edge the bar belongs to. Decides which side its hairline sits on,
   * which safe-area inset it pads for, and which edge it sticks to.
   * @default 'bottom'
   */
  placement?: 'top' | 'bottom'
  /** Pin the bar to that edge while the surrounding scroll container moves. */
  sticky?: boolean
  /** How the actions distribute along the bar. @default 'between' */
  align?: 'start' | 'center' | 'end' | 'between'
  /** Draw the hairline dividing the bar from the content it borders. */
  separator?: boolean
  /**
   * `plain` is transparent — right for a sheet footer, which already sits on a
   * surface. `surface` paints an opaque background, which a sticky bar needs
   * because content scrolls underneath it and there is no vibrancy in this
   * system to blur it away. Defaults to `surface` when `sticky`, else `plain`.
   */
  variant?: 'plain' | 'surface'
  /** Pad past the home indicator, the notch and the landscape rounded corners. */
  safeArea?: boolean
}

/**
 * A bar of actions: the bottom of a sheet, the top of a pane, the foot of a
 * detail view.
 *
 * It is a real ARIA toolbar, which means the arrow keys have to work — a
 * screen-reader user told "toolbar" will reach for them, and a row of buttons
 * that only responds to Tab is the tell that the role was decoration. Home and
 * End jump to the ends, and the whole handler stands down inside any control
 * that owns the arrow keys for itself.
 *
 * Tab order is left alone deliberately: a strict roving tabindex would hide
 * every action but one from sequential navigation, which is the wrong trade for
 * a bar that usually holds three or four buttons.
 */
export function Toolbar({
  children,
  placement = 'bottom',
  sticky = false,
  align = 'between',
  separator = false,
  variant,
  safeArea = false,
  className,
  onKeyDown,
  ...rest
}: ToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const surface = variant ?? (sticky ? 'surface' : 'plain')

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return

    const target = event.target as HTMLElement
    if (target.closest(OWNS_ARROWS)) return

    const nodes = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    const from = nodes.indexOf(target.closest<HTMLElement>(FOCUSABLE) ?? target)
    if (nodes.length === 0 || from === -1) return

    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    const next =
      step !== 0
        ? (from + step + nodes.length) % nodes.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? nodes.length - 1
            : -1
    if (next === -1) return

    // Only now, once a move is certain — otherwise Escape and Enter would be
    // swallowed on their way to whatever the bar is attached to.
    event.preventDefault()
    nodes[next]!.focus()
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      role="toolbar"
      data-slot="toolbar"
      data-variant={surface}
      data-placement={placement}
      data-align={align}
      data-sticky={sticky ? 'true' : undefined}
      data-separator={separator ? 'true' : undefined}
      data-safe-area={safeArea ? 'true' : undefined}
      className={cx('may-toolbar', className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

/**
 * A flexible gap. Two of these around a group centre it; one pushes everything
 * after it to the far edge — the way a UIKit toolbar is laid out.
 *
 * Reach for it instead of `align="between"` whenever the split is uneven.
 */
export function ToolbarSpacer() {
  return <span data-slot="toolbar-spacer" className="may-toolbar__spacer" aria-hidden />
}
