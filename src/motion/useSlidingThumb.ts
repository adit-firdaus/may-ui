import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { applyThumb, geometryFor, segmentAt, SETTLE_MS } from './sliding-thumb'
import type { ThumbAxis } from './sliding-thumb'
import { rubber } from './gesture'

/**
 * The sliding-thumb gesture, as a hook.
 *
 * SegmentedControl proved the whole thing — a thumb that slides on the
 * compositor, puffs while held, rubber-bands past the ends, previews the item
 * under the finger and commits on release. Five more controls want it, and the
 * size budget will not carry five copies, so it lives here once.
 *
 * Two modes, because the drag and the squish are the same gesture cut at
 * different lengths. Both find the item under the pointer and puff the thumb;
 * only the drag mode keeps listening after the finger moves. A control that
 * lives inside a horizontal scroller (Tabs, CapsuleTabs) takes press-only, so
 * it never claims the pan axis its own scroller needs — pass no `onSelect` and
 * that is what you get.
 *
 * The hook works in INDICES. It knows nothing about values or options: the
 * component owns selection, passes `selectedIndex`/`itemCount`, and is told a
 * new index on release. Keyboard stays with the component too — every consumer
 * wants a different arrow-key policy.
 *
 * Generic gesture state is published on the track for a component's own
 * decoration to read: `data-dragging` / `data-following` attributes and a signed
 * `--may-thumb-overdrag` length. SegmentedControl's fill squeeze is driven
 * entirely off those, so the hook never has to know it exists.
 */

/** How far the thumb can be pulled past the ends, however hard you pull. */
const OVERDRAG_MAX = 56

export interface SlidingThumbOptions {
  /** Which way the thumb slides. @default 'inline' */
  axis?: ThumbAxis
  itemCount: number
  /** The item the thumb rests on. -1 hides the thumb (an empty selection). */
  selectedIndex: number
  /**
   * Present enables the DRAG: the gesture previews the item under the pointer
   * and calls this with the landed index on release. Absent is press-only —
   * the thumb puffs when its own item is pressed and settles when selection
   * changes, but the pointer is never tracked, so a scroller keeps its axis.
   */
  onSelect?: (index: number) => void
  /** Items a drag may not land on. Defaults to none disabled. */
  isDisabled?: (index: number) => boolean
  /**
   * Pill ends need the radius divided by the scale or a scaled 1px box shears;
   * a square underline does not. @default false
   */
  roundEnds?: boolean
  pressScale?: number
  settleMs?: number
  easing?: string
  overdragMax?: number
  /**
   * When false the hook is inert — no positioning, no gesture. For a control
   * that shows the thumb only sometimes (Selector's one-line chips, Pagination
   * outside compact). @default true
   */
  enabled?: boolean
}

export interface SlidingThumbApi<T extends HTMLElement, I extends HTMLElement> {
  /** The positioned track the thumb is measured against and laid out in. */
  trackRef: RefObject<T>
  /** The 1px thumb element. */
  thumbRef: RefObject<HTMLSpanElement>
  /** Ref callback for item `index`. */
  registerItem: (index: number) => (node: I | null) => void
  /** True while a drag is in progress — for the component's `data-dragging`. */
  dragging: boolean
  /** Spread onto the track. Starts the gesture. */
  onPointerDown: (event: ReactPointerEvent<T>) => void
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useSlidingThumb<T extends HTMLElement = HTMLDivElement, I extends HTMLElement = HTMLElement>({
  axis = 'inline',
  itemCount,
  selectedIndex,
  onSelect,
  isDisabled,
  roundEnds = false,
  pressScale,
  settleMs = SETTLE_MS,
  easing,
  overdragMax = OVERDRAG_MAX,
  enabled = true,
}: SlidingThumbOptions): SlidingThumbApi<T, I> {
  const reducedMotion = useReducedMotion()
  const draggable = onSelect !== undefined

  const trackRef = useRef<T>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const itemRefs = useRef<(I | null)[]>([])
  const [dragging, setDragging] = useState(false)

  const firstPaint = useRef(true)
  /** Rubber-banded distance past the end, px. Never state: it changes per move
   *  and nothing renders from it. */
  const overdrag = useRef(0)
  /** Pointer position along the axis while dragging, or null when the thumb
   *  belongs to an item. */
  const pointerPos = useRef<number | null>(null)
  /*
   * The gesture lives in refs, not state: a tap fast enough to put pointerdown
   * and pointerup in one tick would find `dragging` still false on the way out
   * and drop the selection. `dragging` is state only because CSS reads it.
   */
  const active = useRef(false)
  const gesture = useRef<AbortController | null>(null)
  const moved = useRef(false)
  /** The item the gesture is previewing. Selection follows it on release. */
  const hit = useRef(selectedIndex)

  const disabledAt = useCallback(
    (index: number) => (isDisabled ? isDisabled(index) : false),
    [isDisabled],
  )

  /** Written straight to the DOM: the previewed item changes every move, and a
   *  render per frame to move one attribute is what refs exist to avoid. */
  const markHit = useCallback((index: number) => {
    itemRefs.current.forEach((node, i) => {
      if (!node) return
      if (i === index) node.setAttribute('data-hit', 'true')
      else node.removeAttribute('data-hit')
    })
  }, [])

  const position = useCallback(
    (index: number, opts: { following?: boolean; pressed?: boolean } = {}) => {
      const track = trackRef.current
      const thumb = thumbRef.current
      if (!track || !thumb) return

      // An empty selection has nowhere to sit: hide the thumb and leave.
      if (index < 0) {
        thumb.style.opacity = '0'
        return
      }
      const item = itemRefs.current[index]
      if (!item) return
      thumb.style.opacity = ''

      // Every measurement first, then every write: interleaving them makes the
      // browser flush layout twice for one selection change.
      let geometry = geometryFor(track, item, axis)

      /*
       * Aimed by POINTER position, not by the thumb's own centre — a thumb
       * still carrying a wide item's width could never reach a narrow one at
       * the end of the track. It centres on the pointer inside the track and
       * stretches only once the pointer itself leaves it.
       */
      if (pointerPos.current !== null) {
        const first = itemRefs.current[0]
        const last = itemRefs.current[itemCount - 1]
        if (first && last) {
          const trackRect = track.getBoundingClientRect()
          const origin = axis === 'block' ? trackRect.top : trackRect.left
          const lead = axis === 'block' ? first.offsetTop : first.offsetLeft
          const trail =
            axis === 'block'
              ? last.offsetTop + last.offsetHeight
              : last.offsetLeft + last.offsetWidth
          const p = pointerPos.current - origin
          const max = trail - geometry.width
          overdrag.current =
            p < lead
              ? -rubber(lead - p, overdragMax)
              : p > trail
                ? rubber(p - trail, overdragMax)
                : 0
          const wanted = p - geometry.width / 2
          geometry = { ...geometry, x: Math.min(Math.max(wanted, lead), max) }
        }
      }

      // Generic gesture state, for a component's own decoration to read.
      track.style.setProperty('--may-thumb-overdrag', `${overdrag.current}px`)
      if (opts.following) track.setAttribute('data-following', 'true')
      else track.removeAttribute('data-following')

      if (geometry.width <= 0) return

      /*
       * A 1px box stretched by scale carries its border-radius stretched too:
       * authored as `--may-radius-full` a pill's ends render as a shear across
       * half of it. Dividing the along-axis half of the radius by the same
       * factor the transform multiplies it by cancels the stretch exactly, at
       * every width. A square underline does not want this, hence `roundEnds`.
       */
      if (roundEnds) {
        const radius = (axis === 'block' ? thumb.offsetWidth : thumb.offsetHeight) / 2
        if (radius > 0) {
          const shrunk = `${radius / geometry.width}px`
          thumb.style.borderRadius =
            axis === 'block' ? `${radius}px / ${shrunk}` : `${shrunk} / ${radius}px`
        }
      }

      applyThumb(thumb, geometry, {
        ...opts,
        axis,
        overdrag: overdrag.current,
        pressScale,
        easing,
        settleMs,
        // Never animate into place on first paint — the thumb would fly in
        // from the leading edge on every mount.
        reducedMotion: reducedMotion || firstPaint.current,
      })
    },
    [axis, itemCount, overdragMax, roundEnds, pressScale, easing, settleMs, reducedMotion],
  )

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return
    /*
     * While a pointer is down the handlers own the thumb and this must keep its
     * hands off, or its write races the press animation a frame later.
     */
    if (pointerPos.current !== null) return
    hit.current = selectedIndex
    // Published so a component's own decoration can share the thumb's clock.
    trackRef.current?.style.setProperty('--may-thumb-settle', `${settleMs}ms`)
    position(selectedIndex)
    firstPaint.current = false
  }, [enabled, selectedIndex, position, itemCount, settleMs])

  // An unfinished gesture must not keep listening after the control is gone.
  useEffect(() => () => gesture.current?.abort(), [])

  useEffect(() => {
    if (!enabled || typeof ResizeObserver === 'undefined' || !trackRef.current) return
    const ro = new ResizeObserver(() => {
      if (pointerPos.current === null) position(selectedIndex)
    })
    ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [enabled, position, selectedIndex])

  const pointerAxis = (event: PointerEvent | ReactPointerEvent<T>) =>
    axis === 'block' ? event.clientY : event.clientX

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!active.current) return
      pointerPos.current = pointerAxis(event)
      const items = itemRefs.current.filter(Boolean) as HTMLElement[]
      const index = segmentAt(items, pointerAxis(event), axis)
      if (index >= 0 && !disabledAt(index)) {
        hit.current = index
        markHit(index)
      }
      // 1:1 tracking starts on the first real MOVE, not on the press: killing
      // the transition while the finger is still where it landed teleports the
      // press instead of flying it to the touch point.
      moved.current = true
      position(hit.current, { pressed: true, following: true })
    },
    [axis, disabledAt, markHit, position],
  )

  const endDrag = useCallback(
    (event: PointerEvent) => {
      if (!active.current) return
      active.current = false
      gesture.current?.abort()
      gesture.current = null
      const landed = hit.current
      overdrag.current = 0
      pointerPos.current = null
      moved.current = false
      markHit(-1)
      setDragging(false)
      if (trackRef.current?.hasPointerCapture(event.pointerId)) {
        trackRef.current.releasePointerCapture(event.pointerId)
      }
      // Letting go is what chooses. It may or may not change the selection, so
      // the settle is written either way rather than left to an effect that
      // only runs when the index actually moves.
      if (draggable && landed !== selectedIndex && landed >= 0 && !disabledAt(landed)) {
        onSelect!(landed)
      }
      position(landed >= 0 ? landed : selectedIndex)
    },
    [draggable, onSelect, selectedIndex, disabledAt, markHit, position],
  )

  /** Ends a press-only puff — no tracking happened, so there is nothing to commit. */
  const endPress = useCallback(() => {
    if (!active.current) return
    active.current = false
    gesture.current?.abort()
    gesture.current = null
    position(selectedIndex)
  }, [position, selectedIndex])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (!enabled || event.button !== 0) return

      const items = itemRefs.current.filter(Boolean) as HTMLElement[]
      const index = segmentAt(items, pointerAxis(event), axis)

      if (!draggable) {
        /*
         * Press-only: puff the thumb only when the item pressed is the one it
         * already sits under. Pressing a different item is a plain click the
         * component turns into a selection, and the non-selected items carry
         * their own `.may-pressable` feedback. No window move listener and no
         * `touch-action` claim, so the parent scroller keeps its pan axis; a
         * scroll fires pointercancel, which releases the puff.
         */
        if (index !== selectedIndex || index < 0) return
        active.current = true
        gesture.current?.abort()
        const ctrl = new AbortController()
        gesture.current = ctrl
        const opts = { signal: ctrl.signal }
        window.addEventListener('pointerup', endPress, opts)
        window.addEventListener('pointercancel', endPress, opts)
        window.addEventListener('lostpointercapture', endPress, opts)
        position(selectedIndex, { pressed: true })
        return
      }

      active.current = true
      setDragging(true)
      trackRef.current?.setPointerCapture(event.pointerId)

      /*
       * The rest of the gesture is heard on the WINDOW: a release outside the
       * element — dragged off the viewport, or out of the app — never reaches a
       * handler bound to the element, and the control would stick mid-drag.
       * `lostpointercapture` is in the list because the browser can take capture
       * away without ever sending an up. One AbortController drops all four.
       */
      gesture.current?.abort()
      const ctrl = new AbortController()
      gesture.current = ctrl
      const opts = { signal: ctrl.signal }
      window.addEventListener('pointermove', onPointerMove, opts)
      window.addEventListener('pointerup', endDrag, opts)
      window.addEventListener('pointercancel', endDrag, opts)
      window.addEventListener('lostpointercapture', endDrag, opts)

      /*
       * The press PREVIEWS; it does not choose. Selection lands on release, so a
       * drag that changes its mind halfway costs nothing. The first placement
       * keeps the settle transition, so the thumb travels to the pointer rather
       * than teleporting under it.
       */
      pointerPos.current = pointerAxis(event)
      moved.current = false
      hit.current = index >= 0 && !disabledAt(index) ? index : selectedIndex
      markHit(hit.current)
      position(hit.current, { pressed: true })
    },
    [enabled, draggable, axis, selectedIndex, disabledAt, endPress, endDrag, onPointerMove, markHit, position],
  )

  const registerItem = useCallback(
    (index: number) => (node: I | null) => {
      itemRefs.current[index] = node
    },
    [],
  )

  return { trackRef, thumbRef, registerItem, dragging, onPointerDown }
}
