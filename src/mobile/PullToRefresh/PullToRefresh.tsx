import type { HTMLAttributes, MutableRefObject, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { cx } from '../../utils/cx'
import type { DragSample } from '../../motion/gesture'
import { velocityFrom } from '../../motion/gesture'
import { duration } from '../../motion/springs'
import type { PullStatus } from '../../motion/pull-physics'
import {
  dampPull,
  pullProgress,
  resolvePullStatus,
  shouldTriggerRefresh,
} from '../../motion/pull-physics'
/*
 * A value import: the indicator renders the real activity indicator, spokes and
 * all, and this file only overrides how they are lit while the pull is still
 * being made. A type-only import would be erased at compile time and the
 * bundler would code-split `.may-spinner` away from anything that renders
 * nothing but a PullToRefresh — which paints an empty ring.
 */
import { Spinner } from '../../components/Spinner'
import './PullToRefresh.css'

export interface PullToRefreshProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  /**
   * Runs when the pull is released past the threshold. The indicator stays up
   * until the returned promise settles, so a refresh that takes a second reads
   * as a second of work rather than a flash.
   */
  onRefresh: () => void | Promise<unknown>
  children?: ReactNode
  /** Distance at which releasing triggers a refresh, in px. @default 64 */
  threshold?: number
  /** Hard ceiling for the damped pull, in px. @default 140 */
  max?: number
  disabled?: boolean
  /** Announced while the refresh runs. @default 'Refreshing' */
  label?: string
  /**
   * Receives the scroller this component owns.
   *
   * NavBar and NavigationBar drive their large-title collapse from a scroll
   * container's ref, and this component's scroller is internal — so without
   * this a bar could never collapse above a pull-to-refresh list, which is
   * exactly the shape a Mail inbox wants.
   */
  scrollRef?: MutableRefObject<HTMLDivElement | null>
}

/**
 * Pull a scroll container past its top edge to refresh it.
 *
 * The component owns the scroller (give it a bounded height and it fills it),
 * because the gesture has to know the exact moment `scrollTop` reaches zero —
 * a wrapper around someone else's scroller cannot.
 *
 * None of the physics lives here: `dampPull` decides how much the surface
 * gives, `resolvePullStatus` names the state, `shouldTriggerRefresh` weighs the
 * release, and `pullProgress` fills the ring. They sit in motion/pull-physics
 * so they can be reasoned about — and unit-tested — without simulating a single
 * pointer event.
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 64,
  max = 140,
  disabled = false,
  label = 'Refreshing',
  scrollRef: externalScrollRef,
  className,
  ...rest
}: PullToRefreshProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Mirror the scroller onto the caller's ref so a bar can observe it. */
  useEffect(() => {
    if (!externalScrollRef) return
    externalScrollRef.current = scrollRef.current
    return () => {
      externalScrollRef.current = null
    }
  }, [externalScrollRef])
  const [status, setStatus] = useState<PullStatus>('idle')

  /*
   * Everything the gesture touches lives in refs. The pull writes two custom
   * properties per frame, and routing that through React state would put the
   * whole list on the animation frame for a value two elements read. Only the
   * status — which changes at most a handful of times per gesture — is state.
   */
  const statusRef = useRef<PullStatus>('idle')
  const distance = useRef(0)
  const origin = useRef(0)
  const samples = useRef<DragSample[]>([])
  const pulling = useRef(false)
  const alive = useRef(true)
  const settling = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      alive.current = false
      if (settling.current) clearTimeout(settling.current)
    },
    [],
  )

  /** Write the pull to the DOM. `--may-ptr-progress` is what fills the ring. */
  const paint = (next: number) => {
    const root = rootRef.current
    if (!root) return
    distance.current = next
    root.style.setProperty('--may-ptr-pull', `${next}px`)
    root.style.setProperty('--may-ptr-progress', String(pullProgress(next, { threshold })))
  }

  const to = (next: PullStatus) => {
    if (next === statusRef.current) return
    statusRef.current = next
    setStatus(next)
  }

  const refresh = async () => {
    to('refreshing')
    // Hold the ring at exactly the trigger point: the pull is over, the work is
    // not, and the indicator has to stay somewhere it can be seen.
    paint(threshold)
    try {
      await onRefresh()
    } catch {
      // The caller owns its own failure UI. The control still has to come back,
      // and a rejected refresh that leaves the spinner up forever is worse than
      // one that quietly stops.
    } finally {
      if (alive.current) {
        // A beat at `complete` so a refresh that resolves in 20ms still reads as
        // having happened, rather than snapping back before the eye lands on it.
        to('complete')
        paint(0)
        settling.current = setTimeout(() => {
          if (alive.current) to('idle')
        }, duration.settle)
      }
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    const root = rootRef.current
    if (disabled || !el || !root || statusRef.current === 'refreshing') return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // The pull only exists at the very top. Anywhere else this press is a scroll,
    // and the scroller owns it.
    if (el.scrollTop > 0) return
    /*
     * Deliberately no pointer capture. The scroller is full of rows that are
     * real buttons, and a captured pointer retargets its own release to the
     * capturing element — every tap inside the list would stop working. A pull
     * travels downward into a tall element, so the pointer stays over it anyway,
     * and `pointerleave` closes the one case where it does not.
     */
    pulling.current = true
    root.dataset.pulling = 'true'
    origin.current = event.clientY
    samples.current = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }]
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pulling.current) return
    samples.current.push({ x: event.clientX, y: event.clientY, t: event.timeStamp })
    if (samples.current.length > 12) samples.current.shift()
    // dampPull returns 0 for anything upward, so a finger that changes its mind
    // hands the gesture back to the scroller without a special case here.
    const next = dampPull(event.clientY - origin.current, { threshold, max })
    paint(next)
    to(resolvePullStatus(next, false, { threshold }))
  }

  const end = () => {
    if (!pulling.current) return
    pulling.current = false
    const root = rootRef.current
    if (root) delete root.dataset.pulling
    const travelled = distance.current
    const velocity = velocityFrom(samples.current, 'y')
    samples.current = []
    // Distance alone under-reads a decisive flick; shouldTriggerRefresh weighs both.
    if (travelled > 0 && shouldTriggerRefresh(travelled, velocity, { threshold })) {
      void refresh()
      return
    }
    paint(0)
    to('idle')
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      data-slot="pull-to-refresh"
      data-status={status}
      className={cx('may-ptr', className)}
    >
      <div className="may-ptr__indicator">
        {/*
         * Silent until the work actually starts: a live region that announces on
         * every aborted pull is noise, and the message only exists once there is
         * something to wait for.
         */}
        <Spinner size="sm" label={label} decorative={status !== 'refreshing'} />
      </div>
      <div
        ref={scrollRef}
        data-slot="scroll-area"
        className="may-ptr__scroller"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
      >
        {children}
      </div>
    </div>
  )
}
