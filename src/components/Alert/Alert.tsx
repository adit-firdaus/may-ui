import type { AnimationEvent, HTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MayTone } from '../../types'
import './Alert.css'

// `title` here is a node, not the DOM's tooltip string, so the native one goes.
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default 'tint' */
  tone?: MayTone
  /** Bold first line. Optional — a one-line notice reads better without one. */
  title?: ReactNode
  /** The message. */
  children?: ReactNode
  /**
   * Overrides the tone's own glyph. Pass `null` to drop the glyph entirely,
   * for a dense stack of alerts where five icons in a column is noise.
   */
  icon?: ReactNode
  /** Renders the close button. Fires once the exit animation has finished. */
  onDismiss?: () => void
  /** @default 'Dismiss' */
  dismissLabel?: string
  /** Buttons under the message — typically one `plain` and one `tinted`. */
  actions?: ReactNode
}

/**
 * An inline message.
 *
 * A tinted fill and a tone-coloured glyph, never a stroke — a bordered alert is
 * the single most recognisable "this is a web page" tell in an otherwise native
 * screen. The TEXT stays full-contrast rather than taking the tone: orange type
 * on an orange wash is unreadable at footnote size, and the glyph already
 * carries the tone.
 *
 * Dismissal is animated properly: the close button starts the exit and
 * `onDismiss` fires on `animationend`, so the consumer unmounts the alert after
 * it has visibly left rather than yanking it out from under the animation.
 * Under reduced motion base.css collapses that animation to 1ms, so the same
 * code path dismisses immediately with no special case here.
 */
export function Alert({
  tone = 'tint',
  title,
  children,
  icon,
  onDismiss,
  dismissLabel = 'Dismiss',
  actions,
  role,
  className,
  ...rest
}: AlertProps) {
  const [exiting, setExiting] = useState(false)
  const { pressProps } = usePressFeedback(!onDismiss)
  const glyph = icon === undefined ? toneGlyph(tone) : icon

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // The entrance lands here too, as do any animations bubbling from children.
    if (!exiting || event.target !== event.currentTarget) return
    onDismiss?.()
    // If the consumer leaves the alert mounted, springing back is a far better
    // failure than a permanently invisible element holding layout.
    setExiting(false)
  }

  return (
    <div
      {...rest}
      data-slot="alert"
      data-tone={tone}
      data-exiting={exiting ? 'true' : undefined}
      // Only a destructive message is worth interrupting a screen reader for.
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cx('may-alert', className)}
      onAnimationEnd={onAnimationEnd}
    >
      {glyph != null && (
        <span className="may-alert__icon" aria-hidden>
          {glyph}
        </span>
      )}

      <div className="may-alert__content">
        {title != null && <p className="may-alert__title">{title}</p>}
        {children != null && (
          <div className="may-alert__body" data-slot="body">
            {children}
          </div>
        )}
        {actions && <div className="may-alert__actions">{actions}</div>}
      </div>

      {onDismiss && (
        <button
          {...pressProps}
          type="button"
          onClick={() => setExiting(true)}
          aria-label={dismissLabel}
          className="may-alert__dismiss may-pressable may-hoverable"
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

/**
 * SF-Symbol-shaped glyphs, drawn as strokes rather than filled shapes so they
 * take the tone from `currentColor` and stay legible on a wash of it.
 */
function toneGlyph(tone: MayTone): ReactNode {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (tone === 'success') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden focusable="false">
        <circle cx="10" cy="10" r="8.2" {...stroke} />
        <path d="M6.4 10.3l2.5 2.5 4.8-5.4" {...stroke} />
      </svg>
    )
  }

  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden focusable="false">
        <path
          d="M10.9 3.4l7 12.1a1 1 0 0 1-.9 1.5H3a1 1 0 0 1-.9-1.5l7-12.1a1 1 0 0 1 1.8 0Z"
          {...stroke}
        />
        <path d="M10 7.8v3.9" {...stroke} />
        <circle cx="10" cy="14.2" r="0.95" fill="currentColor" />
      </svg>
    )
  }

  if (tone === 'danger') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden focusable="false">
        <circle cx="10" cy="10" r="8.2" {...stroke} />
        <path d="M10 5.9v5.1" {...stroke} />
        <circle cx="10" cy="13.9" r="0.95" fill="currentColor" />
      </svg>
    )
  }

  // tint and neutral share the information glyph.
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="8.2" {...stroke} />
      <path d="M10 9.1v5" {...stroke} />
      <circle cx="10" cy="6.2" r="0.95" fill="currentColor" />
    </svg>
  )
}
