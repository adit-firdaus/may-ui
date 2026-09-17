import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { RUBBER_MAX, draggable, projectFlick, rubber } from '../../motion/gesture'
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect'

/**
 * `horizontal` splits the box left/right, so the divider itself is vertical.
 * The prop describes the *split*, which is the way people describe it out loud.
 */
export type SplitPaneOrientation = 'horizontal' | 'vertical'

export interface SplitPaneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  /** Exactly two children: the sized pane, then the pane that takes the rest. */
  children: ReactNode
  /** @default 'horizontal' */
  orientation?: SplitPaneOrientation
  /**
   * Size of the FIRST pane, in px. Controlled.
   *
   * Named `paneSize` rather than `size` because everywhere else in the package
   * `size` is a step on the shared scale — `'sm' | 'md' | 'lg'` — and one
   * component where it silently means pixels is the kind of collision that
   * only ever surfaces as a confused consumer.
   */
  paneSize?: number
  /** @default 260 */
  defaultPaneSize?: number
  onPaneSizeChange?: (size: number) => void
  /** @deprecated Use `paneSize`. Kept so no existing caller breaks. */
  size?: number
  /** @deprecated Use `defaultPaneSize`. */
  defaultSize?: number
  /** @deprecated Use `onPaneSizeChange`. */
  onSizeChange?: (size: number) => void
  /** @default 180 */
  min?: number
  /** @default 480 */
  max?: number
  /** Lets the first pane be dragged shut, and re-opened from the divider. */
  collapsible?: boolean
  /** Controlled collapse. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Accessible name for the divider. @default 'Resize panes' */
  dividerLabel?: string
}

/** Arrow-key step, in px. Coarse enough to be useful, fine enough to aim. */
const KEY_STEP = 16

/*
 * +1 when the inline axis runs left-to-right, -1 when it runs right-to-left.
 *
 * A pointer delta and an arrow key are both PHYSICAL, while the pane they
 * size is the first child — which `dir="rtl"` puts on the right. Multiplying
 * by this is what keeps the divider under the pointer in both directions.
 */
const inlineSign = (root: HTMLElement | null): 1 | -1 =>
  root && getComputedStyle(root).direction === 'rtl' ? -1 : 1
/**
 * How far into the rubber band a release has to be for the pane to let go and
 * collapse. Half the band's travel: far enough that it takes intent, close
 * enough that you feel the resistance give way before it happens.
 */
const COLLAPSE_SLOP = RUBBER_MAX / 2

/**
 * Two panes and a draggable divider.
 *
 * The divider renders as a hairline and hit-tests as a 17px band: a
 * pseudo-element extends the target past the line on both sides, so the thing
 * you aim at is a comfortable target while the thing you see stays a hairline.
 *
 * The drag itself runs through `draggable()` — pointer capture, so a fast drag
 * that outruns the divider still reports its own release — and drives a CSS
 * custom property while it is in flight, committing to React state only when
 * the pointer lifts. Sixty renders a second to move one flex-basis is work the
 * compositor never asked for.
 *
 * When `collapsible`, dragging below `min` meets rubber-band resistance rather
 * than a wall, and letting go past half that band collapses the pane. It is the
 * same asymptotic curve the sheet uses to resist an upward drag.
 */
export function SplitPane({
  children,
  orientation = 'horizontal',
  paneSize,
  defaultPaneSize,
  onPaneSizeChange,
  size,
  defaultSize,
  onSizeChange,
  min = 180,
  max = 480,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  dividerLabel = 'Resize panes',
  className,
  id,
  ...rest
}: SplitPaneProps) {
  /* New name wins; the old one still works. */
  const sizeProp = paneSize ?? size
  const initialSizeProp = defaultPaneSize ?? defaultSize ?? 260
  const emitSize = onPaneSizeChange ?? onSizeChange
  const [first, second] = Children.toArray(children)
  const autoId = useAutoId(id)
  const paneId = `${autoId}-pane`

  const rootRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLButtonElement>(null)

  const [internalSize, setInternalSize] = useState(initialSizeProp)
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [dragging, setDragging] = useState(false)
  /** The container's extent along the split axis, so `max` can never exceed it. */
  const [extent, setExtent] = useState(0)

  const isCollapsed = collapsed ?? internalCollapsed
  const horizontal = orientation === 'horizontal'

  // The second pane keeps `min` for itself: a divider that can be shoved off
  // the far edge is a resize that destroys the thing you were resizing for.
  const effectiveMax = extent > 0 ? Math.min(max, Math.max(min, extent - min)) : max
  const committed = Math.min(Math.max(sizeProp ?? internalSize, min), effectiveMax)
  const shown = isCollapsed ? 0 : committed

  const commitSize = useCallback(
    (next: number) => {
      if (sizeProp === undefined) setInternalSize(next)
      emitSize?.(next)
    },
    [sizeProp, emitSize],
  )

  const commitCollapsed = useCallback(
    (next: boolean) => {
      if (collapsed === undefined) setInternalCollapsed(next)
      onCollapsedChange?.(next)
    },
    [collapsed, onCollapsedChange],
  )

  /* Measure the container so `effectiveMax` tracks a resized window. */
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => setExtent(horizontal ? root.offsetWidth : root.offsetHeight)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [horizontal])

  /*
   * Live values the drag reads without re-subscribing. The pointer listener is
   * attached once per orientation; closing over state would rebind it on every
   * resize, and rebinding mid-drag drops the gesture.
   */
  const live = useRef({
    shown,
    min,
    max: effectiveMax,
    collapsible,
    collapsed: isCollapsed,
    commitSize,
    commitCollapsed,
  })
  useIsomorphicLayoutEffect(() => {
    live.current = {
      shown,
      min,
      max: effectiveMax,
      collapsible,
      collapsed: isCollapsed,
      commitSize,
      commitCollapsed,
    }
  })

  useEffect(() => {
    const divider = dividerRef.current
    const root = rootRef.current
    if (!divider || !root) return

    let start = 0
    /** A drag that begins on a shut pane is opening it, not resizing it. */
    let reopening = false

    /** Where the pane should sit for a raw drag target, resistance included. */
    const resolve = (raw: number) => {
      const { min: lo, max: hi, collapsible: canCollapse } = live.current
      if (raw > hi) return hi
      if (raw >= lo) return raw
      if (!canCollapse) return lo
      // Pulling a shut pane back open tracks the pointer exactly — resistance
      // there would feel like the pane was refusing to come back. Squeezing an
      // open one below `min` meets the band instead: it gives more slowly the
      // further you pull, and never quite reaches zero.
      return reopening ? Math.max(0, raw) : Math.max(0, lo + rubber(raw - lo))
    }

    /*
     * The drag writes its own custom property rather than the pane's style,
     * and CSS prefers it only while `data-dragging` is set. React keeps sole
     * ownership of --may-splitpane-size, so there is no imperative value left
     * behind for it to diff against — and when the flag clears at the end of
     * the gesture, flex-basis transitions from wherever the pointer left it to
     * whatever was committed, for free.
     */
    const track = (value: number) => root.style.setProperty('--may-splitpane-drag', `${value}px`)

    return draggable(divider, {
      axis: horizontal ? 'x' : 'y',
      onStart: () => {
        start = live.current.shown
        reopening = live.current.collapsed
        track(start)
        setDragging(true)
      },
      onMove: ({ dx, dy }) => {
        track(resolve(start + (horizontal ? dx * inlineSign(root) : dy)))
      },
      onEnd: ({ dx, dy, vx, vy }) => {
        setDragging(false)
        const { min: lo, max: hi, collapsible: canCollapse } = live.current
        const sign = inlineSign(root)
        const target = start + (horizontal ? dx * sign : dy)
        // Distance alone would make a short, fast flick toward the edge feel
        // ignored, so the decision reads where the flick was heading.
        const projected = target + projectFlick(horizontal ? vx * sign : vy)

        // Symmetrical thresholds: half the band's travel closes an open pane,
        // and the same distance out of the edge is what reopens a shut one.
        if (canCollapse && projected < (reopening ? COLLAPSE_SLOP : lo - COLLAPSE_SLOP)) {
          live.current.commitCollapsed(true)
          return
        }
        live.current.commitCollapsed(false)
        live.current.commitSize(Math.min(Math.max(target, lo), hi))
      },
    })
    /*
     * Orientation alone. The commit callbacks deliberately do NOT appear here:
     * a consumer passing an inline `onSizeChange` changes their identity every
     * render, and re-subscribing between pointerdown and pointerup would tear
     * the listeners off the divider halfway through the gesture.
     */
  }, [horizontal])

  const nudge = (delta: number) => {
    commitCollapsed(false)
    commitSize(Math.min(Math.max((isCollapsed ? 0 : committed) + delta, min), effectiveMax))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    /*
     * The arrows are physical; the pane they size is not.
     *
     * The sized pane is the first child, which `dir="rtl"` puts on the RIGHT
     * — so there the key that grows it is ArrowLeft, and a pointer dragging
     * left grows it too. Without this the divider moved AWAY from the
     * pointer: measured in RTL, dragging 77px left shrank the pane from 240
     * to 163 instead of growing it to 317.
     */
    const rtl = horizontal && inlineSign(rootRef.current) < 0
    const decrease = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
    const increase = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'

    switch (event.key) {
      case decrease:
        event.preventDefault()
        nudge(-KEY_STEP)
        break
      case increase:
        event.preventDefault()
        nudge(KEY_STEP)
        break
      case 'Home':
        event.preventDefault()
        nudge(min - committed)
        break
      case 'End':
        event.preventDefault()
        nudge(effectiveMax - committed)
        break
      case 'Enter':
      case ' ':
        if (!collapsible) return
        // preventDefault stops the button's synthetic click, which would
        // otherwise toggle a second time.
        event.preventDefault()
        commitCollapsed(!isCollapsed)
        break
      default:
        break
    }
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      id={autoId}
      data-slot="split-pane"
      data-orientation={orientation}
      data-collapsed={isCollapsed ? 'true' : undefined}
      data-dragging={dragging ? 'true' : undefined}
      className={cx('may-splitpane', className)}
      style={{ ...rest.style, '--may-splitpane-size': `${shown}px` } as CSSProperties}
    >
      <div
        id={paneId}
        data-slot="scroll-area"
        className="may-splitpane__pane may-splitpane__pane--start"
      >
        {first}
      </div>

      <button
        ref={dividerRef}
        type="button"
        /* A real <button>, not a div with handlers: it has to be focusable and
         * key-operable, and `role="separator"` on top of it gives assistive
         * tech the window-splitter pattern with its value range. */
        role="separator"
        /* For a separator, orientation describes the LINE — a left/right split
         * is divided by a vertical one. */
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-label={dividerLabel}
        aria-controls={paneId}
        aria-valuenow={Math.round(shown)}
        aria-valuemin={collapsible ? 0 : min}
        aria-valuemax={Math.round(effectiveMax)}
        onKeyDown={onKeyDown}
        onDoubleClick={() => {
          commitCollapsed(false)
          commitSize(initialSizeProp)
        }}
        data-slot="split-divider"
        className="may-splitpane__divider"
      />

      <div data-slot="scroll-area" className="may-splitpane__pane may-splitpane__pane--end">
        {second}
      </div>
    </div>
  )
}
