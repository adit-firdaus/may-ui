import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import type { DragSample } from '../../motion/gesture'
import { clampWithRubber, projectFlick, velocityFrom } from '../../motion/gesture'
import type { MaySize, MayTone } from '../../types'
/*
 * A value import: the bubble IS a Fab — same tones, same sizes, same
 * press-and-bounce — parked on an edge and made draggable. A type-only import
 * would be erased at compile time and the bundler would code-split `.may-fab`
 * away from anything that renders nothing but a bubble, which paints a bare
 * unstyled button.
 */
import { Fab } from '../../components/Fab'

/** Which edge the bubble parks on. Logical, so it mirrors under RTL. */
export type BubbleEdge = 'start' | 'end'

export interface FloatingBubbleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'children'> {
  /** The glyph. A bare `<svg>` is scaled to the control by CSS. */
  icon: ReactNode
  /** Required: a bubble is icon-first and has no visible name of its own. */
  'aria-label': string
  /** An optional label, which extends the circle into a pill. */
  children?: ReactNode
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  /** Edge it parks on before it has been dragged. @default 'end' */
  defaultEdge?: BubbleEdge
  /** How far down that edge it starts, 0 (top) to 1 (bottom). @default 0.62 */
  defaultOffset?: number
  /** Fired by a tap. A drag is not a tap, and never produces this. */
  onClick?: () => void
  /** Fired when a release lands the bubble on a different edge. */
  onEdgeChange?: (edge: BubbleEdge) => void
  disabled?: boolean
  className?: string
}

/** Movement below this is still a tap, not a drag. */
const SLOP = 4

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A floating bubble that can be thrown at the edges of the display.
 *
 * It tracks the finger anywhere on screen, resists past the safe area rather
 * than stopping dead at it, and on release flies to whichever side edge the
 * flick was actually headed for — `projectFlick` answers "where would this have
 * ended up", so a bubble thrown from the middle commits to the far edge instead
 * of snapping back to the near one.
 *
 * Only the side edges catch it. A bubble parked along the top would sit under
 * the status bar and the navigation chrome, and one along the bottom lands on
 * the home indicator; the sides are also the only edges a thumb can reach
 * without moving the hand.
 *
 * The gesture is on the button itself rather than on the wrapper that positions
 * it. A captured pointer retargets its own release, so capturing on a wrapper
 * would mean the tap that ends a non-drag never reaching the button — the
 * bubble would be draggable and unpressable.
 */
export function FloatingBubble({
  icon,
  children,
  'aria-label': ariaLabel,
  tone = 'tint',
  size = 'md',
  defaultEdge = 'end',
  defaultOffset = 0.62,
  onClick,
  onEdgeChange,
  disabled = false,
  className,
  ...rest
}: FloatingBubbleProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const [edge, setEdge] = useState<BubbleEdge>(defaultEdge)
  const [dragging, setDragging] = useState(false)

  /* Position is written straight to the DOM: a re-render per pointermove would
   * put the host's whole tree on the animation frame for one translate. */
  const at = useRef({ x: 0, y: 0 })
  const dragged = useRef(false)
  const edgeRef = useRef<BubbleEdge>(defaultEdge)
  const notify = useRef(onEdgeChange)
  useEffect(() => {
    notify.current = onEdgeChange
  })

  const place = (x: number, y: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    at.current = { x, y }
    // The independent `translate` property, not a transform: the Fab inside
    // owns `transform` for its press and hover scales, and the two must compose
    // rather than take turns wiping each other out.
    wrap.style.translate = `${x}px ${y}px`
  }

  /**
   * How far the bubble may travel, in the physical pixels the pointer reports.
   *
   * The gap from the display edge and the safe-area insets live in the
   * stylesheet as margins, so nothing here has to know about env() — it reads
   * back whatever those margins resolved to.
   */
  const limits = () => {
    const wrap = wrapRef.current
    if (!wrap) return { x: 0, y: 0 }
    const style = getComputedStyle(wrap)
    const insetX = parseFloat(style.marginLeft) + parseFloat(style.marginRight)
    const insetY = parseFloat(style.marginTop) + parseFloat(style.marginBottom)
    const doc = document.documentElement
    return {
      x: Math.max(0, doc.clientWidth - insetX - wrap.offsetWidth),
      y: Math.max(0, doc.clientHeight - insetY - wrap.offsetHeight),
    }
  }

  /** Physical right, for a logical edge. */
  const isRight = (target: BubbleEdge) => {
    const wrap = wrapRef.current
    const rtl = wrap ? getComputedStyle(wrap).direction === 'rtl' : false
    return (target === 'end') !== rtl
  }

  const settle = (target: BubbleEdge, y: number) => {
    const max = limits()
    place(isRight(target) ? max.x : 0, clamp(y, 0, max.y))
    if (target === edgeRef.current) return
    edgeRef.current = target
    setEdge(target)
    notify.current?.(target)
  }

  /* Park it before the first paint, or it would fly in from the top-left corner. */
  useIsomorphicLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const max = limits()
    place(isRight(edgeRef.current) ? max.x : 0, max.y * clamp(defaultOffset, 0, 1))
    // Only now is a transition on `translate` meaningful; before this the bubble
    // had no position to travel from.
    wrap.dataset.placed = 'true'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A rotation or a resized window must not leave the bubble stranded off-screen. */
  useEffect(() => {
    const onResize = () => settle(edgeRef.current, at.current.y)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const btn = fabRef.current
    if (!btn || disabled) return

    let origin = { x: 0, y: 0 }
    let from = { x: 0, y: 0 }
    let samples: DragSample[] = []

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
      btn.setPointerCapture(event.pointerId)
      origin = { x: event.clientX, y: event.clientY }
      from = { ...at.current }
      samples = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }]
      dragged.current = false
    }

    const move = (event: PointerEvent) => {
      if (!btn.hasPointerCapture(event.pointerId)) return
      samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp })
      if (samples.length > 12) samples.shift()
      const dx = event.clientX - origin.x
      const dy = event.clientY - origin.y
      if (!dragged.current) {
        // A bubble that shifts under a thumb which only meant to press it feels
        // broken, so nothing moves until the intent is unambiguous.
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
        dragged.current = true
        setDragging(true)
      }
      const max = limits()
      // Past the safe area it keeps giving, less and less — it never detaches
      // from the display, and it never stops dead against an invisible wall.
      place(clampWithRubber(from.x + dx, 0, max.x), clampWithRubber(from.y + dy, 0, max.y))
    }

    const up = (event: PointerEvent) => {
      if (btn.hasPointerCapture(event.pointerId)) btn.releasePointerCapture(event.pointerId)
      if (!dragged.current) return // a tap: the button's own click owns it
      setDragging(false)
      const max = limits()
      // Where the throw would have ended up, had nothing stopped it. Distance
      // alone would snap a hard flick back to the edge it started from.
      const landedX = at.current.x + projectFlick(velocityFrom(samples, 'x'))
      const landedY = at.current.y + projectFlick(velocityFrom(samples, 'y'))
      const right = landedX > max.x / 2
      settle(right === isRight('end') ? 'end' : 'start', landedY)
      samples = []
    }

    btn.addEventListener('pointerdown', down)
    btn.addEventListener('pointermove', move)
    btn.addEventListener('pointerup', up)
    btn.addEventListener('pointercancel', up)
    return () => {
      btn.removeEventListener('pointerdown', down)
      btn.removeEventListener('pointermove', move)
      btn.removeEventListener('pointerup', up)
      btn.removeEventListener('pointercancel', up)
    }
  }, [disabled])

  const guardClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // The release that ends a drag still produces a click. It is not an
    // activation, and firing the bubble's action after parking it is the single
    // most annoying thing a draggable control can do.
    if (!dragged.current) return
    dragged.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  /*
   * Arrow keys move the bubble, because a control that can only be positioned by
   * dragging cannot be positioned at all without a pointer.
   */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const right = event.key === 'ArrowRight'
      settle(right === isRight('end') ? 'end' : 'start', at.current.y)
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      // An eighth of the run per press: eight presses cross the display, which
      // is few enough to be practical and coarse enough to stay predictable.
      const step = limits().y / 8
      settle(edgeRef.current, at.current.y + (event.key === 'ArrowDown' ? step : -step))
    }
  }

  return (
    <div
      {...rest}
      ref={wrapRef}
      data-slot="floating-bubble"
      data-tone={tone}
      data-size={size}
      data-edge={edge}
      data-dragging={dragging ? 'true' : undefined}
      className={cx('may-bubble', className)}
      onClickCapture={guardClick}
      onKeyDown={onKeyDown}
    >
      <Fab
        ref={fabRef}
        icon={icon}
        aria-label={ariaLabel}
        tone={tone}
        size={size}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Fab>
    </div>
  )
}
