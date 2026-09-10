import { useEffect } from 'react'
import { cx } from '../../utils/cx'
import { useIsDesktop } from '../../hooks/useIsDesktop'
/*
 * A value import: the host renders real `<Toast>` elements, so pulling the
 * component in as a value is what keeps Toast.css in the bundle beside it.
 */
import { Toast, dismiss, setToastLimit, useToast } from '../Toast/Toast'
import type { ToastPosition, ToastRecord } from '../Toast/Toast'
import './MayHost.css'

export interface MayHostProps {
  /**
   * Where toasts appear when they do not name a position themselves.
   *
   * Defaults adaptively, because the platforms disagree: iOS drops a banner
   * from the top centre, macOS slides one in at the top trailing corner. Set it
   * explicitly to opt out.
   */
  position?: ToastPosition
  /** Toasts on screen at once. The oldest is dropped when a new one arrives. @default 3 */
  max?: number
  /** Default auto-dismiss in ms for toasts that do not set their own. `0` is sticky. */
  duration?: number
  /** Accessible name for every close chip. @default 'Dismiss' */
  closeLabel?: string
  /** Accessible name for the toast region. @default 'Notifications' */
  label?: string
  className?: string
}

/**
 * The mount point for imperative surfaces. Render it once, near the root:
 *
 *   <MayProvider>
 *     <App />
 *     <MayHost />
 *   </MayProvider>
 *
 * Today it owns the toast viewport. It exists as its own component — rather
 * than as a `<Toaster>` — because everything imperative eventually needs the
 * same thing: one place the app has already agreed to render, so `toast()`,
 * and later `confirm()`, can be called from code that has no tree of its own.
 *
 * It renders one viewport per position actually in use rather than six empty
 * fixed-position boxes, so a page with no toasts costs nothing but an empty
 * `display: contents` wrapper.
 */
export function MayHost({
  position,
  max = 3,
  duration,
  closeLabel,
  label = 'Notifications',
  className,
}: MayHostProps) {
  const { toasts } = useToast()
  const isDesktop = useIsDesktop()

  // The store owns the cap: dropping the oldest has to happen when a toast is
  // queued, not when it is rendered.
  useEffect(() => setToastLimit(max), [max])

  const fallback: ToastPosition = position ?? (isDesktop ? 'top-end' : 'top-center')

  // Grouped, not sorted: the queue is already oldest-first, and each viewport
  // decides which end of itself is "newest" from the edge it is pinned to.
  const groups = new Map<ToastPosition, ToastRecord[]>()
  for (const record of toasts) {
    // Queued behind the limit: it has no place on screen yet, and rendering it
    // would start its duration counting down before anyone could read it.
    if (record.pending) continue
    const at = record.position ?? fallback
    const group = groups.get(at)
    if (group) group.push(record)
    else groups.set(at, [record])
  }

  return (
    <div data-slot="may-host" className={cx('may-host', className)}>
      {[...groups].map(([at, records]) => {
        const [side, align] = at.split('-')
        return (
          <div
            key={at}
            role="region"
            aria-label={label}
            data-slot="toast-viewport"
            data-side={side}
            data-align={align}
            className="may-toast-viewport"
          >
            {records.map((record) => (
              /*
               * The slot animates the SPACE the toast occupies; the toast
               * animates itself. Without it a dismissal only fades the capsule
               * while its height stays put until React unmounts the record, and
               * the rest of the stack jumps a whole toast plus one gap in a
               * single frame. Same two-layer arrangement as Alert.
               */
              <div
                key={record.id}
                className="may-toast-slot"
                data-closing={record.dismissed ? 'true' : undefined}
              >
                <div className="may-toast-slot__inner">
                  <Toast
                    title={record.title}
                    description={record.description}
                    tone={record.tone}
                    icon={record.icon}
                    action={record.action}
                    dismissible={record.dismissible}
                    closeButton={record.closeButton}
                    closeLabel={record.closeLabel ?? closeLabel}
                    duration={record.duration ?? duration}
                    position={at}
                    closed={record.dismissed}
                    /* The store, not the component, decides when a record
                       leaves — the toast only asks. That is what lets a
                       dismissal survive the toast unmounting halfway through
                       its exit. */
                    onDismiss={() => dismiss(record.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
