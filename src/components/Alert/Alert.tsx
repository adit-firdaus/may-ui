import type { AnimationEvent, HTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoInformationCircleOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MayTone } from '../../types'

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
 *
 * In a STACK, set `--may-alert-gap` on the container to whatever its `gap` is:
 *
 *   <div style={{ display: 'flex', flexDirection: 'column',
 *                 gap: 'var(--may-space-3)',
 *                 ['--may-alert-gap' as string]: 'var(--may-space-3)' }}>
 *
 * Without it the gap the alert leaves behind collapses in a single frame when
 * the node unmounts, which reads as a jump. See Alert.css.
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
      {/* The root is a height track and the slot is what it resizes; the box
       * is the card, at its natural height throughout. So appearing and
       * dismissing animate the SPACE the alert occupies, while the card
       * itself only scales and fades. See Alert.css. */}
      <div className="may-alert__slot">
        <div className="may-alert__box">
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
              {/* xmark — the chip behind it is smaller than the button, so the
                  glyph stays iOS-sized while the tap target stays a full 44pt.
                  Same affordance as Toast and Modal: a close control in this
                  system is a chip, not a bare glyph. */}
              <span className="may-alert__dismiss-chip" aria-hidden>
                <IoClose focusable="false" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Ionicons' SF-Symbol-shaped glyphs, in their OUTLINE cut rather than the solid
 * one: the alert already sits on a wash of its own tone, and a filled triangle
 * on an 18% orange wash is one flat orange shape. The outline keeps its
 * interior readable, and `currentColor` still carries the tone.
 *
 * The glyph takes `may-alert__glyph` because react-icons always emits
 * `width`/`height` attributes — the class is what `.may-alert__icon`'s sizing
 * rule matches on, so the glyph keeps scaling with the alert's text.
 */
function toneGlyph(tone: MayTone): ReactNode {
  const glyphProps = {
    className: 'may-alert__glyph',
    'aria-hidden': true,
    focusable: 'false',
  } as const

  if (tone === 'success') return <IoCheckmarkCircleOutline {...glyphProps} />
  if (tone === 'warning') return <IoWarningOutline {...glyphProps} />
  if (tone === 'danger') return <IoAlertCircleOutline {...glyphProps} />

  // tint and neutral share the information glyph.
  return <IoInformationCircleOutline {...glyphProps} />
}
