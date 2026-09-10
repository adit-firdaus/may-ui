import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
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
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './Popover.css'

/** Which edge of the anchor the panel sits against. */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'

/** Where the panel sits along that edge. */
export type PopoverAlign = 'start' | 'center' | 'end'

/** `'bottom'`, `'bottom-start'`, `'left-end'`, … — a side, optionally aligned. */
export type PopoverPlacement = PopoverSide | `${PopoverSide}-${Exclude<PopoverAlign, 'center'>}`

const OPPOSITE: Record<PopoverSide, PopoverSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * These four are geometry, not design values, so they are plain numbers rather
 * than tokens: they feed `getBoundingClientRect` arithmetic, and reading a
 * custom property back out of the cascade on every scroll frame would cost a
 * forced style recalc for no gain.
 */

/** Default gap between anchor and panel — `--may-space-2` expressed in px. */
const DEFAULT_OFFSET = 8
/** Closest the panel is ever allowed to get to a viewport edge. */
const VIEWPORT_PADDING = 8
/** How far the arrow protrudes: half the diagonal of a `--may-space-3` square. */
const ARROW_REACH = 8
/** Keeps the arrow off the rounded corners — `--may-radius-sheet` plus the tip. */
const ARROW_MARGIN = 24
/** Matches `--may-duration-fast`; the panel stays mounted this long to animate out. */
const EXIT_MS = 150

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface FloatingPosition {
  x: number
  y: number
  side: PopoverSide
  align: PopoverAlign
  /** The anchor's centre, in px from the panel's leading edge along its cross axis. */
  anchorOffset: number
  /** Room the chosen side actually has, so a long panel scrolls instead of overflowing. */
  maxHeight: number
}

/**
 * Anchored placement with flip and shift, in viewport coordinates.
 *
 * Shared with Tooltip rather than duplicated: the flip rule below is the kind
 * of decision that goes subtly wrong when two copies drift apart.
 *
 * Exported from this module, deliberately not from the package barrel — it is
 * an implementation detail of the overlay family, not public API.
 */
export function placeFloating(
  anchor: DOMRect,
  panel: { width: number; height: number },
  placement: PopoverPlacement,
  gap: number,
): FloatingPosition {
  // clientWidth/Height rather than innerWidth/Height: they exclude a classic
  // scrollbar, which is exactly the strip a fixed panel must not sit under.
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight

  const [preferred, requested] = placement.split('-') as [PopoverSide, PopoverAlign | undefined]
  const align: PopoverAlign = requested ?? 'center'

  const room: Record<PopoverSide, number> = {
    top: anchor.top - VIEWPORT_PADDING,
    bottom: vh - anchor.bottom - VIEWPORT_PADDING,
    left: anchor.left - VIEWPORT_PADDING,
    right: vw - anchor.right - VIEWPORT_PADDING,
  }

  const vertical = preferred === 'top' || preferred === 'bottom'
  const needed = (vertical ? panel.height : panel.width) + gap
  const opposite = OPPOSITE[preferred]

  // Flip only when the preferred side cannot fit AND the opposite side has more
  // room. Flipping into an equally cramped side just moves the clipping, and
  // the panel jitters between the two as the page scrolls.
  const side =
    room[preferred] >= needed || room[opposite] <= room[preferred] ? preferred : opposite

  const onVerticalAxis = side === 'top' || side === 'bottom'
  const maxHeight = onVerticalAxis ? room[side] - gap : vh - VIEWPORT_PADDING * 2
  const height = Math.min(panel.height, maxHeight)
  const width = Math.min(panel.width, vw - VIEWPORT_PADDING * 2)

  let x = 0
  let y = 0
  if (side === 'top') y = anchor.top - gap - height
  else if (side === 'bottom') y = anchor.bottom + gap
  else if (side === 'left') x = anchor.left - gap - width
  else x = anchor.right + gap

  const anchorStart = onVerticalAxis ? anchor.left : anchor.top
  const anchorSpan = onVerticalAxis ? anchor.width : anchor.height
  const panelSpan = onVerticalAxis ? width : height

  let cross = anchorStart + (anchorSpan - panelSpan) / 2
  if (align === 'start') cross = anchorStart
  else if (align === 'end') cross = anchorStart + anchorSpan - panelSpan

  // Shift back inside the viewport. This runs after the flip so it corrects the
  // side the panel actually landed on, and the outer Math.max keeps a panel
  // wider than the viewport pinned to the leading edge rather than the trailing.
  const limit = (onVerticalAxis ? vw : vh) - VIEWPORT_PADDING - panelSpan
  cross = Math.max(VIEWPORT_PADDING, Math.min(cross, Math.max(VIEWPORT_PADDING, limit)))
  if (onVerticalAxis) x = cross
  else y = cross

  const margin = Math.min(ARROW_MARGIN, panelSpan / 2)
  const centre = anchorStart + anchorSpan / 2 - cross
  const anchorOffset = Math.max(margin, Math.min(centre, panelSpan - margin))

  // Whole pixels: a panel at a half-pixel offset renders its text blurred on a
  // 1x display, and the difference is invisible on every other one.
  return {
    x: Math.round(x),
    y: Math.round(y),
    side,
    align,
    anchorOffset: Math.round(anchorOffset),
    maxHeight: Math.round(maxHeight),
  }
}

/**
 * Keeps a closed overlay mounted for the length of its exit animation.
 *
 * Unmounting the moment `open` goes false makes every dismissal instant, which
 * next to an entrance that springs reads as a glitch rather than a decision.
 */
export function useExitDelay(open: boolean, ms: number): boolean {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    if (!mounted) return
    const timer = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(timer)
  }, [open, mounted, ms])

  return mounted
}

/** Props Popover injects into whatever element it is handed as a trigger. */
interface TriggerProps {
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
  'aria-haspopup'?: 'dialog' | 'menu' | 'listbox'
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export interface PopoverProps {
  /**
   * The anchor. A React element is cloned so the open state lands on the real
   * control; anything else is wrapped in a plain button, because a popover you
   * cannot reach from the keyboard is not a popover.
   */
  trigger: ReactNode
  children?: ReactNode
  /** @default 'bottom' */
  placement?: PopoverPlacement
  /** Visual gap between anchor and panel, in px. @default 8 */
  offset?: number
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial state. @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Draw the pointer arrow. @default true */
  arrow?: boolean
  /**
   * `'none'` renders the panel as a plain box, for content that carries its own
   * role — a Menu owning its items, for instance. @default 'dialog'
   */
  role?: 'dialog' | 'none'
  /** What the trigger advertises it opens. @default 'dialog' */
  haspopup?: 'dialog' | 'menu' | 'listbox'
  /** Move focus into the panel when it opens. @default true */
  autoFocus?: boolean
  /** Inset the panel's content. Turn off for edge-to-edge rows. @default true */
  padded?: boolean
  /** Class for the inline wrapper around the trigger. */
  className?: string
  /** Class for the floating panel itself. */
  surfaceClassName?: string
  'aria-label'?: string
}

/**
 * An anchored floating panel.
 *
 * Positioned from a live `getBoundingClientRect`, with a flip to the opposite
 * side and a shift along the edge when the viewport would clip it — recomputed
 * on scroll and resize, so a panel never detaches from its trigger.
 *
 * It is deliberately non-modal: no scrim, no focus trap, no scroll lock. A
 * popover that locks the page is a Sheet, and this system already has one.
 * Dismissal is the full native set — outside press, Escape, and focus leaving
 * the panel — with focus handed back to the trigger on the paths where the
 * user did not choose somewhere else to put it.
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom',
  offset = DEFAULT_OFFSET,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  arrow = true,
  role = 'dialog',
  haspopup = 'dialog',
  autoFocus = true,
  padded = true,
  className,
  surfaceClassName,
  'aria-label': ariaLabel,
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const reducedMotion = useReducedMotion()
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)

  const rootRef = useRef<HTMLSpanElement>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  /** Set when the close came from focus going somewhere the user chose. */
  const skipRestore = useRef(false)
  const wasOpen = useRef(open)
  const surfaceId = useAutoId()
  const { pressProps } = usePressFeedback()

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  /* ------------------------------- placement ------------------------------ */

  const gap = offset + (arrow ? ARROW_REACH : 0)

  const reposition = useCallback(() => {
    const anchor = anchorRef.current
    const surface = surfaceRef.current
    if (!anchor || !surface) return

    // offsetWidth/offsetHeight rather than a rect: during the entrance the panel
    // is mid-scale, and a rect would measure the animated size and walk the
    // panel away from its anchor frame by frame.
    surface.style.maxHeight = ''
    const panel = { width: surface.offsetWidth, height: surface.offsetHeight }
    const next = placeFloating(anchor.getBoundingClientRect(), panel, placement, gap)

    surface.style.left = `${next.x}px`
    surface.style.top = `${next.y}px`
    surface.style.maxHeight = `${next.maxHeight}px`
    surface.style.setProperty('--may-popover-anchor', `${next.anchorOffset}px`)
    surface.dataset.side = next.side
    surface.dataset.align = next.align
    // Flipped last, in the same frame: the entrance animation is keyed off it,
    // so it can only start once the panel knows where it is.
    surface.dataset.positioned = 'true'
  }, [placement, gap])

  /*
   * `open` sits in the deps alongside `mounted`: reopening inside the exit
   * window reuses the very same node, and without this the panel would come
   * back wherever its anchor happened to be when it left.
   */
  useIsomorphicLayoutEffect(() => {
    if (!mounted) return
    reposition()

    /*
     * Capture phase: scroll does not bubble, and the panel has to follow an
     * ancestor scroller as readily as the window.
     *
     * But a scroll INSIDE the panel is not the anchor moving, and repositioning
     * on it breaks the panel outright: `reposition` clears `max-height` to take
     * an unconstrained measurement, which stops the body overflowing for that
     * instant, and the browser clamps its scrollTop back to 0. Every wheel tick
     * therefore undid itself and a long menu could not be scrolled at all.
     */
    const onScroll = (event: Event) => {
      if (surfaceRef.current?.contains(event.target as Node)) return
      reposition()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)

    // The anchor, not the panel — observing the panel would re-fire on the
    // max-height this very function writes.
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => reposition())
    if (anchorRef.current) observer?.observe(anchorRef.current)

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
      observer?.disconnect()
    }
  }, [mounted, open, reposition])

  /* ------------------------------- dismissal ------------------------------ */

  const requestClose = useCallback(
    (restoreFocus: boolean) => {
      skipRestore.current = !restoreFocus
      setOpen(false)
    },
    [setOpen],
  )

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // The topmost dismissible layer owns the key: without this a popover
      // inside a Sheet would take the sheet down with it.
      event.stopPropagation()
      requestClose(true)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      requestClose(false)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, requestClose])

  /* --------------------------------- focus -------------------------------- */

  useEffect(() => {
    if (!open || !autoFocus) return
    const surface = surfaceRef.current
    if (!surface) return
    const target = surface.querySelector<HTMLElement>(FOCUSABLE) ?? surface
    // preventScroll: the panel is already inside the viewport by construction,
    // and letting the browser scroll to it would drag the page under it.
    target.focus({ preventScroll: true })
  }, [open, autoFocus])

  useEffect(() => {
    if (wasOpen.current && !open) {
      const holdingFocus = surfaceRef.current?.contains(document.activeElement)
      if (holdingFocus && !skipRestore.current) {
        const back = anchorRef.current?.querySelector<HTMLElement>(FOCUSABLE)
        back?.focus({ preventScroll: true })
      }
      skipRestore.current = false
    }
    wasOpen.current = open
  }, [open])

  /* -------------------------------- trigger ------------------------------- */

  const toggle = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.defaultPrevented) return
    if (open) requestClose(true)
    else setOpen(true)
  }

  const injected: TriggerProps = {
    'aria-haspopup': haspopup,
    'aria-expanded': open,
    'aria-controls': mounted ? surfaceId : undefined,
  }

  const triggerNode = isValidElement<TriggerProps>(trigger) ? (
    cloneElement(trigger, {
      ...injected,
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        trigger.props.onClick?.(event)
        toggle(event)
      },
    })
  ) : (
    <button
      {...injected}
      {...pressProps}
      type="button"
      onClick={toggle}
      className="may-popover__trigger may-pressable may-hoverable"
    >
      {trigger}
    </button>
  )

  return (
    <span
      ref={rootRef}
      data-slot="popover"
      className={cx('may-popover', className)}
      onBlur={(event) => {
        // relatedTarget is null when focus goes nowhere in particular — pressing
        // a non-focusable area inside the panel, or the window losing focus.
        // Treating that as "focus left" would close the panel out from under a
        // user who has not gone anywhere.
        const next = event.relatedTarget as Node | null
        if (!open || !next || rootRef.current?.contains(next)) return
        requestClose(false)
      }}
    >
      <span ref={anchorRef} className="may-popover__anchor">
        {triggerNode}
      </span>

      {mounted && (
        <div
          ref={surfaceRef}
          id={surfaceId}
          role={role === 'none' ? undefined : role}
          aria-label={ariaLabel}
          tabIndex={-1}
          data-slot="popover-surface"
          data-state={open ? 'open' : 'closed'}
          data-positioned="false"
          data-padded={padded ? undefined : 'false'}
          className={cx('may-popover__surface', surfaceClassName)}
        >
          {arrow && <span className="may-popover__arrow" aria-hidden />}
          <div className="may-popover__body" data-slot="scroll-area" data-scroll-hint="true">
            {children}
          </div>
        </div>
      )}
    </span>
  )
}
