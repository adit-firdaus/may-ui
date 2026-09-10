import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { IoClose } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { clampWithRubber, draggable, projectFlick } from '../../motion/gesture'
import type { MayTone } from '../../types'
/*
 * A value import: the action chip renders with Button's own `.may-button`
 * variant and tone rules, so a type-only import would be erased at compile time
 * and the bundler would code-split those rules away from anything that only
 * ever renders a Toast — which paints an unstyled action.
 */
import { Button } from '../Button'
import './Toast.css'

/** Edge the toast is anchored to, and how it aligns along that edge. */
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'

export interface ToastAction {
  label: string
  onClick: () => void
  /** Dismiss the toast once the action runs. @default true */
  dismiss?: boolean
}

export interface ToastOptions {
  /** Second line, in secondary text. */
  description?: ReactNode
  /** @default 'neutral' */
  tone?: MayTone
  /** Leading glyph, drawn inside a tone-tinted circle. Replaces the tone dot. */
  icon?: ReactNode
  /** Trailing text button — "Undo", "View", "Retry". */
  action?: ToastAction
  /** Auto-dismiss delay in ms. `0` keeps it up until something dismisses it. */
  duration?: number
  /** Overrides the host's placement for this one toast. */
  position?: ToastPosition
  /** Swipe-to-dismiss and the close chip. @default true */
  dismissible?: boolean
  /** Render the close chip. @default true */
  closeButton?: boolean
  /** Accessible name for the close chip. @default 'Dismiss' */
  closeLabel?: string
  /** Fired once, when the toast starts leaving — by timer, swipe, chip or code. */
  onDismiss?: () => void
  /** Re-using an id updates that toast in place instead of queueing another. */
  id?: string
}

/** One entry in the queue. */
export interface ToastRecord extends Omit<ToastOptions, 'id'> {
  id: string
  title: ReactNode
  createdAt: number
  /** True once dismissal has started; the record lives on for its exit animation. */
  dismissed?: boolean
}

/* -------------------------------------------------------------------------- *
 * The store
 *
 * Module level rather than context, because `toast()` has to be callable from
 * a fetch handler, a keyboard shortcut or a router guard — places with no React
 * tree to reach into. Components read it back through `useSyncExternalStore`,
 * so the queue stays tearing-free under concurrent rendering.
 * -------------------------------------------------------------------------- */

/**
 * Must match the exit animation in Toast.css. The removal is timed rather than
 * driven by `animationend` so a toast that is unmounted mid-exit — or was never
 * mounted, because no host was rendered — still leaves the queue.
 */
const EXIT_MS = 300

/** Toasts on screen at once. Reaching it drops the oldest, FIFO. */
const DEFAULT_LIMIT = 3

let queue: ToastRecord[] = []
let limit = DEFAULT_LIMIT
let sequence = 0
const listeners = new Set<() => void>()
const exitTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** Stable identity: `useSyncExternalStore` compares snapshots by reference. */
const EMPTY: ToastRecord[] = []

function publish(next: ToastRecord[]): void {
  queue = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => queue
const getServerSnapshot = () => EMPTY

function clearExit(id: string): void {
  const timer = exitTimers.get(id)
  if (!timer) return
  clearTimeout(timer)
  exitTimers.delete(id)
}

function scheduleRemoval(id: string): void {
  clearExit(id)
  exitTimers.set(
    id,
    setTimeout(() => {
      exitTimers.delete(id)
      publish(queue.filter((entry) => entry.id !== id))
    }, EXIT_MS),
  )
}

/**
 * Enforce the stack limit, oldest first. A dropped toast is *dismissed* rather
 * than deleted, so it animates out under the arriving one instead of blinking
 * off the screen. Toasts already on their way out do not count against the
 * limit — otherwise a burst would drop live toasts to make room for corpses.
 */
function capped(next: ToastRecord[]): ToastRecord[] {
  const live = next.filter((entry) => !entry.dismissed)
  if (live.length <= limit) return next
  const doomed = new Set(live.slice(0, live.length - limit).map((entry) => entry.id))
  doomed.forEach((id) => scheduleRemoval(id))
  return next.map((entry) => (doomed.has(entry.id) ? { ...entry, dismissed: true } : entry))
}

function enqueue(title: ReactNode, options: ToastOptions = {}): string {
  const { id = `may-toast-${++sequence}`, ...rest } = options
  const record: ToastRecord = { ...rest, id, title, createdAt: Date.now() }
  const index = queue.findIndex((entry) => entry.id === id)
  // Re-toasting a live id replaces it in place, so "Saving…" can become "Saved"
  // without the row jumping out and back in. Its pending exit is cancelled: the
  // toast was just given new content, so it is no longer leaving.
  clearExit(id)
  publish(
    capped(
      index === -1
        ? queue.concat(record)
        : queue.map((entry) => (entry.id === id ? record : entry)),
    ),
  )
  return id
}

const withTone =
  (tone: MayTone) =>
  (title: ReactNode, options: ToastOptions = {}): string =>
    enqueue(title, { ...options, tone })

export interface ToastFn {
  (title: ReactNode, options?: ToastOptions): string
  success: (title: ReactNode, options?: ToastOptions) => string
  warning: (title: ReactNode, options?: ToastOptions) => string
  danger: (title: ReactNode, options?: ToastOptions) => string
}

/**
 * Queue a toast; returns its id. Pass that id to `dismiss`, or back into
 * `toast(title, { id })` to update the same toast in place.
 *
 *   const id = toast('Sending…', { duration: 0 })
 *   toast('Sent', { id, tone: 'success' })
 */
export const toast: ToastFn = Object.assign(enqueue, {
  success: withTone('success'),
  warning: withTone('warning'),
  danger: withTone('danger'),
})

/**
 * Start dismissing a toast. Two-phase on purpose: the record is marked first so
 * the mounted toast can play its exit, and removed once that has run.
 */
export function dismiss(id: string): void {
  const record = queue.find((entry) => entry.id === id)
  if (!record || record.dismissed) return
  scheduleRemoval(id)
  publish(queue.map((entry) => (entry.id === id ? { ...entry, dismissed: true } : entry)))
  // Fired only once the queue already says the toast is leaving: a callback
  // that dismisses again — an onDismiss wired straight to dismissAll, say —
  // would otherwise recurse forever.
  record.onDismiss?.()
}

/** Dismiss everything on screen — a route change, a sign-out. */
export function dismissAll(): void {
  for (const entry of queue) if (!entry.dismissed) dismiss(entry.id)
}

/**
 * How many toasts stay on screen. `MayHost` drives this from its `max` prop.
 *
 * The cap lives in the store rather than in the host's render because dropping
 * the oldest has to happen when a toast is *queued*: a host that merely
 * rendered the newest three would leave the rest counting down invisibly and
 * popping into view as the stack drained.
 */
export function setToastLimit(next: number): void {
  limit = Math.max(1, next)
  publish(capped(queue))
}

export interface UseToastResult {
  /** The live queue, oldest first. */
  toasts: ToastRecord[]
  toast: ToastFn
  dismiss: (id: string) => void
  dismissAll: () => void
}

/**
 * The hook form. `toast`, `dismiss` and `dismissAll` are the same module-level
 * functions — the hook exists so a component can also *read* the queue, and so
 * callers who prefer hooks never have to import the loose functions.
 */
export function useToast(): UseToastResult {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => ({ toasts, toast, dismiss, dismissAll }), [toasts])
}

/* -------------------------------------------------------------------------- *
 * The component
 * -------------------------------------------------------------------------- */

/** Auto-dismiss delay when nothing overrides it. */
const DEFAULT_DURATION = 4000

/** Past this fraction of the toast's own size, releasing dismisses it. */
const DISMISS_RATIO = 0.4
/** A decisive flick dismisses from anywhere, in px/ms. */
const DISMISS_VELOCITY = 0.45
/** Travel, in px, over which a swipe fades the toast to `FADE_FLOOR`. */
const FADE_OVER = 180
const FADE_FLOOR = 0.3

/** Elements a drag must never start from — see the guard in the gesture effect. */
const CONTROLS = 'button, a, input, select, textarea, [role="button"]'

export interface ToastProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'id'>,
    Omit<ToastOptions, 'id' | 'position'> {
  /** Primary line. */
  title: ReactNode
  /** Edge this toast is anchored to. Decides its entrance, exit and swipe axis. */
  position?: ToastPosition
  /** True once dismissal has started: plays the exit and stops the countdown. */
  closed?: boolean
}

/**
 * One toast.
 *
 * Rendered for you by `MayHost`; exported because a toast is also a perfectly
 * good inline banner, and because a story can then show every tone at rest.
 *
 * Three behaviours make it feel native rather than like a web notification:
 * the countdown *pauses* under a mouse or a focused action instead of running
 * out while you read it; the swipe tracks the finger exactly, with rubber-band
 * resistance in the direction that would peel it off its edge; and a release
 * decides on projected flick distance, not just how far you got.
 */
export function Toast({
  title,
  description,
  tone = 'neutral',
  icon,
  action,
  duration = DEFAULT_DURATION,
  position = 'bottom-center',
  dismissible = true,
  closeButton = true,
  closeLabel = 'Dismiss',
  closed = false,
  onDismiss,
  className,
  ...rest
}: ToastProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [swiping, setSwiping] = useState(false)
  const { pressProps } = usePressFeedback()

  const side = position.startsWith('top') ? 'top' : 'bottom'
  const frozen = hovered || focused || swiping

  // Held in a ref so the countdown is not restarted every time the host
  // re-renders with a fresh closure.
  const dismissRef = useRef(onDismiss)
  useEffect(() => {
    dismissRef.current = onDismiss
  })

  // Declared before the countdown so that on mount — and on any change of
  // `duration` — the budget is reset before the timer that consumes it starts.
  const remaining = useRef(duration)
  useEffect(() => {
    remaining.current = duration
  }, [duration])

  useEffect(() => {
    if (duration <= 0 || frozen || closed) return
    const startedAt = Date.now()
    const timer = setTimeout(() => dismissRef.current?.(), remaining.current)
    return () => {
      clearTimeout(timer)
      // Deduct what was actually spent, so pausing and resuming *continues* the
      // countdown. Restarting it is how a toast ends up living forever under a
      // cursor that keeps brushing past.
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt))
    }
  }, [duration, frozen, closed])

  /* Swipe-to-dismiss. */
  useEffect(() => {
    const el = rootRef.current
    if (!el || !dismissible || closed) return

    // A press that began on the action or the close chip must never become a
    // drag. Capture phase, so this runs before draggable's own pointerdown
    // listener on the same element and the handlers below can bail out.
    let fromControl = false
    const guard = (event: PointerEvent) => {
      const target = event.target as Element | null
      fromControl = !!target?.closest?.(CONTROLS)
    }
    el.addEventListener('pointerdown', guard, true)

    /*
     * Which axis the drag committed to. `onEnd` reports raw deltas — only
     * `onMove` is axis-locked — so a vertical swipe with a little sideways
     * drift would otherwise be measured against the drift.
     */
    let axis: 'x' | 'y' | null = null

    const release = draggable(el, {
      onStart: () => {
        axis = null
        if (!fromControl) setSwiping(true)
      },
      onMove: ({ dx, dy }) => {
        if (fromControl) return
        if (axis === null && (dx !== 0 || dy !== 0)) axis = dx !== 0 ? 'x' : 'y'
        // Toward its own edge is free; the other way meets rubber-band
        // resistance, so the toast can never be peeled off the edge it lives on.
        const y =
          side === 'top'
            ? clampWithRubber(dy, Number.NEGATIVE_INFINITY, 0)
            : clampWithRubber(dy, 0, Number.POSITIVE_INFINITY)
        el.style.transform = `translate3d(${dx}px, ${y}px, 0)`
        el.style.opacity = String(
          Math.max(FADE_FLOOR, 1 - (Math.abs(dx) + Math.abs(y)) / FADE_OVER),
        )
      },
      onEnd: ({ dx, dy, vx, vy }) => {
        setSwiping(false)
        // Nothing ever moved: a press that never passed the drag threshold, or
        // one that started on a control. Either way it was a tap.
        if (fromControl || axis === null) return

        const horizontal = axis === 'x'
        const distance = horizontal ? dx : dy
        const velocity = horizontal ? vx : vy
        const extent = horizontal ? el.offsetWidth : el.offsetHeight
        // Distance alone under-reads a flick: a short, fast swipe should go.
        const projected = distance + projectFlick(velocity)
        const decisive =
          Math.abs(projected) > extent * DISMISS_RATIO || Math.abs(velocity) > DISMISS_VELOCITY
        // Vertically only the direction of its own edge dismisses; the other way
        // was rubber-banded and springs back.
        const outward = horizontal || (side === 'top' ? projected < 0 : projected > 0)

        if (!decisive || !outward) {
          el.style.transform = ''
          el.style.opacity = ''
          return
        }

        // Leave the way the finger was going rather than playing the standard
        // exit. Written to the DOM rather than to state because React never
        // manages these properties, and because the store's own re-render
        // arrives in the same frame.
        el.dataset.swiped = 'true'
        el.style.transition = `transform var(--may-duration-sheet-out) var(--may-ease-out), opacity var(--may-duration-sheet-out) var(--may-ease-out)`
        const away = projected < 0 ? -1 : 1
        el.style.transform = horizontal
          ? `translate3d(${away * 100}%, 0, 0)`
          : `translate3d(0, ${away * 100}%, 0)`
        el.style.opacity = '0'
        dismissRef.current?.()
      },
    })

    /*
     * Bailing out is not enough on its own: `draggable` takes pointer capture
     * on the capsule for every press, and a captured pointer retargets its own
     * release — so the button under the finger would never see its click.
     * Registered *after* draggable, and therefore run immediately after its
     * capture, this hands the pointer straight back when the press began on a
     * control. Losing capture there costs nothing, because that press is not
     * going to move the toast anyway.
     */
    const yieldCapture = (event: PointerEvent) => {
      if (fromControl && el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId)
      }
    }
    el.addEventListener('pointerdown', yieldCapture)

    return () => {
      el.removeEventListener('pointerdown', guard, true)
      el.removeEventListener('pointerdown', yieldCapture)
      release()
    }
  }, [dismissible, closed, side])

  // A failure needs to interrupt; everything else can wait for a pause in
  // whatever the screen reader is already saying.
  const urgent = tone === 'danger'

  return (
    <div
      {...rest}
      ref={rootRef}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-slot="toast"
      data-tone={tone}
      data-position={position}
      data-state={closed ? 'closed' : 'open'}
      data-dismissible={dismissible ? 'true' : undefined}
      data-swiping={swiping ? 'true' : undefined}
      className={cx('may-toast', className)}
      onPointerEnter={(event) => {
        // Only a real cursor pauses: on touch, pointerenter fires on tap and the
        // matching leave can be swallowed by the gesture, freezing the countdown.
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false)
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {icon ? (
        <span className="may-toast__icon" aria-hidden>
          {icon}
        </span>
      ) : (
        tone !== 'neutral' && <span className="may-toast__dot" aria-hidden />
      )}

      <span className="may-toast__text">
        <span className="may-toast__title">{title}</span>
        {description && <span className="may-toast__description">{description}</span>}
      </span>

      {action && (
        <Button
          variant="plain"
          size="sm"
          /* A neutral toast still wants a tinted action — grey text on a grey
             capsule would not read as the one thing here you can press. */
          tone={tone === 'neutral' ? 'tint' : tone}
          className="may-toast__action"
          onClick={() => {
            action.onClick()
            if (action.dismiss !== false) dismissRef.current?.()
          }}
        >
          {action.label}
        </Button>
      )}

      {dismissible && closeButton && (
        <button
          {...pressProps}
          type="button"
          onClick={() => dismissRef.current?.()}
          aria-label={closeLabel}
          data-slot="toast-close"
          className="may-toast__close may-pressable may-hoverable"
        >
          {/* xmark — the chip behind it is smaller than the button, so the glyph
              stays iOS-sized while the tap target stays a full 44pt. */}
          <span className="may-toast__close-chip" aria-hidden>
            <IoClose focusable="false" />
          </span>
        </button>
      )}
    </div>
  )
}
