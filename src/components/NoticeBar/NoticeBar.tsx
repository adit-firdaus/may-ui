import type { AnimationEvent, CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { MayTone } from '../../types'
import './NoticeBar.css'

export interface NoticeBarProps extends HTMLAttributes<HTMLDivElement> {
  /** The notice. Plain text — a marquee duplicates this node, so keep it inert. */
  children?: ReactNode
  /** @default 'tint' */
  tone?: MayTone
  /** Leading glyph, sized to the text by CSS. */
  icon?: ReactNode
  /** Trailing control — usually a small `plain` Button ("View", "Turn Off"). */
  action?: ReactNode
  /** Renders the close button. Fires once the bar has finished leaving. */
  onClose?: () => void
  /** @default 'Dismiss' */
  closeLabel?: string
  /**
   * Scroll the notice when it is too long for the bar. It only actually
   * scrolls when the text really does overflow — a marquee on a message that
   * already fits is motion for its own sake.
   */
  marquee?: boolean
  /**
   * Marquee speed in px per second. 44 is about a comfortable reading pace for
   * a single line; much past 60 and the tail is gone before you reach it.
   * @default 44
   */
  speed?: number
}

/**
 * A full-width banner for something transient — recording in progress, a
 * degraded connection, an alert the whole screen needs to know about.
 *
 * The marquee is measured rather than guessed. One copy of the message carries
 * its own trailing gap as padding, so that copy's width IS the distance the
 * track has to travel for a seamless loop, and a second copy behind it fills
 * the space the first one vacates. Nothing is hard-coded and any string length
 * loops perfectly.
 *
 * Under reduced motion the marquee is not slowed, it is removed: the second
 * copy is never rendered and the message wraps instead. That decision cannot be
 * made in CSS, because a wrapped bar and a scrolling one need different markup.
 */
export function NoticeBar({
  children,
  tone = 'tint',
  icon,
  action,
  onClose,
  closeLabel = 'Dismiss',
  marquee = false,
  speed = 44,
  role,
  className,
  ...rest
}: NoticeBarProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()
  const [shift, setShift] = useState(0)
  const [exiting, setExiting] = useState(false)
  const { pressProps } = usePressFeedback(!onClose)

  const active = marquee && !reducedMotion
  const scrolling = shift > 0

  useEffect(() => {
    const viewport = viewportRef.current
    const copy = copyRef.current
    if (!active || !viewport || !copy) {
      setShift(0)
      return
    }

    const measure = () => {
      // The trailing padding is the gap between loops, so it has to come off
      // before asking whether the TEXT overflows — otherwise a message that
      // fits comfortably would start scrolling because of its own gap.
      const gap = parseFloat(getComputedStyle(copy).paddingInlineEnd) || 0
      const natural = copy.offsetWidth - gap
      setShift(natural > viewport.clientWidth ? copy.offsetWidth : 0)
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return

    // `children` is deliberately not a dependency: a message that changes
    // changes the copy's width, and the observer already watches that. Watching
    // the node identity instead would rebuild the observer on every render of
    // whatever owns this bar.
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(copy)
    return () => observer.disconnect()
  }, [active])

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // The entrance ends here too, and the marquee bubbles up from the track.
    if (!exiting || event.target !== event.currentTarget) return
    onClose?.()
    setExiting(false)
  }

  return (
    <div
      {...rest}
      data-slot="notice-bar"
      data-tone={tone}
      data-marquee={active ? 'true' : undefined}
      data-exiting={exiting ? 'true' : undefined}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cx('may-notice', className)}
      onAnimationEnd={onAnimationEnd}
    >
      {icon && (
        <span className="may-notice__icon" aria-hidden>
          {icon}
        </span>
      )}

      <div className="may-notice__viewport" ref={viewportRef}>
        <div
          className="may-notice__track"
          data-scrolling={scrolling ? 'true' : undefined}
          style={
            scrolling
              ? ({
                  '--may-notice-shift': `${shift}px`,
                  // Content-derived, not a design duration: holding a constant
                  // SPEED is what keeps a long notice and a short one equally
                  // readable. A token here would do the opposite.
                  '--may-notice-duration': `${shift / speed}s`,
                } as CSSProperties)
              : undefined
          }
        >
          <span className="may-notice__copy" ref={copyRef}>
            {children}
          </span>
          {/* The chase copy. Hidden from assistive tech — the message is the
              same one, and hearing it twice is worse than not seeing it loop. */}
          {scrolling && (
            <span className="may-notice__copy" aria-hidden>
              {children}
            </span>
          )}
        </div>
      </div>

      {action && <div className="may-notice__action">{action}</div>}

      {onClose && (
        <button
          {...pressProps}
          type="button"
          onClick={() => setExiting(true)}
          aria-label={closeLabel}
          className="may-notice__close may-pressable may-hoverable"
        >
          <svg viewBox="0 0 16 16" aria-hidden focusable="false">
            <path
              d="M4.5 4.5l7 7M11.5 4.5l-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
