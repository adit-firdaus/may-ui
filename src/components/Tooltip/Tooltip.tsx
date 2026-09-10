import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { useReducedMotion } from '../../hooks/useReducedMotion'
/*
 * A value import, and from Popover's module rather than a copy: the flip/shift
 * rules are the kind of decision that goes quietly wrong once two versions of
 * it exist. `useExitDelay` comes along for the same reason.
 */
import { placeFloating, useExitDelay } from '../Popover/Popover'
import type { PopoverPlacement } from '../Popover/Popover'
import './Tooltip.css'

/** Gap between the control and its hint, in px — `--may-space-2`. */
const DEFAULT_OFFSET = 8
/** Matches `--may-duration-fast`; the hint stays mounted this long to fade out. */
const EXIT_MS = 150

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Whether this pointer can actually hover.
 *
 * Checked at the moment of the event rather than once at mount: a laptop with a
 * touchscreen switches between the two mid-session, and a hint that appeared
 * because the machine *has* a mouse would still be wrong under a finger.
 */
function canHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** `:focus-visible` is unsupported in older engines, where the throw is the answer. */
function isKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(':focus-visible')
  } catch {
    return true
  }
}

/** Props Tooltip injects into the control it describes. */
interface TriggerProps {
  'aria-describedby'?: string
}

export interface TooltipProps {
  /** The control being described. */
  children: ReactNode
  /** The hint. A few words — anything longer belongs in the interface. */
  label: ReactNode
  /** @default 'top' */
  placement?: PopoverPlacement
  /** Gap between control and hint, in px. @default 8 */
  offset?: number
  /** How long the pointer must rest before the hint appears, in ms. @default 500 */
  delay?: number
  /** Suppress the hint entirely, without unmounting the control. */
  disabled?: boolean
  className?: string
}

/**
 * A hint on hover and on keyboard focus.
 *
 * It never appears on touch. That is not a nicety: a tooltip bound to tap has
 * no dismissal gesture, so it either swallows the tap that was meant for the
 * control or strands itself on screen — and the label it carries is invisible
 * to the user until they have already pressed the thing it describes. The
 * hover path is gated on the pointer that fired the event *and* on
 * `(hover: hover) and (pointer: fine)`, while the focus path stays open so a
 * keyboard user still gets the hint.
 *
 * Consequently the hint is never the only place a meaning lives. Give an
 * icon-only control a real `aria-label` as well; this describes, it does not name.
 */
export function Tooltip({
  children,
  label,
  placement = 'top',
  offset = DEFAULT_OFFSET,
  delay = 500,
  disabled = false,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const mounted = useExitDelay(open && !disabled, reducedMotion ? 0 : EXIT_MS)

  const anchorRef = useRef<HTMLSpanElement>(null)
  const surfaceRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useAutoId()

  const cancel = useCallback(() => {
    if (!timer.current) return
    clearTimeout(timer.current)
    timer.current = null
  }, [])

  const show = useCallback(
    (after: number) => {
      cancel()
      if (after <= 0) {
        setOpen(true)
        return
      }
      timer.current = setTimeout(() => setOpen(true), after)
    },
    [cancel],
  )

  const hide = useCallback(() => {
    cancel()
    setOpen(false)
  }, [cancel])

  useEffect(() => cancel, [cancel])

  /* ------------------------------- placement ------------------------------ */

  const reposition = useCallback(() => {
    const anchor = anchorRef.current
    const surface = surfaceRef.current
    if (!anchor || !surface) return

    // offsetWidth/offsetHeight, not a rect: the hint is mid-scale while it
    // arrives, and a rect would measure the animation instead of the box.
    const panel = { width: surface.offsetWidth, height: surface.offsetHeight }
    const next = placeFloating(anchor.getBoundingClientRect(), panel, placement, offset)

    surface.style.left = `${next.x}px`
    surface.style.top = `${next.y}px`
    surface.style.setProperty('--may-tooltip-anchor', `${next.anchorOffset}px`)
    surface.dataset.side = next.side
    surface.dataset.positioned = 'true'
  }, [placement, offset])

  /* `open` alongside `mounted`: re-entering inside the fade-out window reuses
   * the same node, which would otherwise return at the last anchor's spot. */
  useIsomorphicLayoutEffect(() => {
    if (!mounted) return
    reposition()
    const onScroll = () => reposition()
    // Capture phase: scroll does not bubble, and the hint has to follow an
    // ancestor scroller as readily as the window.
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [mounted, open, reposition])

  /* ------------------------------- dismissal ------------------------------ */

  useEffect(() => {
    if (!open) return
    // WCAG 2.1: content shown on hover or focus must be dismissible without
    // moving the pointer, because a hint can cover the thing it describes.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, hide])

  /* -------------------------------- trigger ------------------------------- */

  const onPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    // Both halves matter. `pointerType` rejects the finger on a hybrid laptop;
    // the media query rejects a device that reports a mouse it does not have.
    if (event.pointerType !== 'mouse' || !canHover()) return
    show(delay)
  }

  const child = isValidElement<TriggerProps>(children)
    ? cloneElement(children, {
        // Compose rather than replace: the control may already point at its own
        // help text, and dropping that would trade one description for another.
        'aria-describedby': mounted
          ? [children.props['aria-describedby'], id].filter(Boolean).join(' ')
          : children.props['aria-describedby'],
      })
    : children

  return (
    <span
      data-slot="tooltip"
      className={cx('may-tooltip', className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={hide}
      // A press means the user has committed to the control; the hint has said
      // everything it has to say.
      onPointerDown={hide}
      onFocus={(event) => {
        if (isKeyboardFocus(event.target)) show(0)
      }}
      onBlur={hide}
    >
      <span ref={anchorRef} className="may-tooltip__anchor">
        {child}
      </span>

      {mounted && (
        <span
          ref={surfaceRef}
          id={id}
          role="tooltip"
          data-slot="tooltip-surface"
          data-state={open && !disabled ? 'open' : 'closed'}
          data-positioned="false"
          className="may-tooltip__surface"
        >
          {label}
        </span>
      )}
    </span>
  )
}
