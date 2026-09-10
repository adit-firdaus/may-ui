import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { MaySize, MayTone } from '../../types'
import './Spinner.css'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Defaults to `neutral` rather than `tint`: an activity indicator is almost
   * always sitting on top of content the user is waiting for, and a blue one
   * reads as a control they could press.
   * @default 'neutral'
   */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /**
   * Spoke count. UIKit draws 8; 12 reads smoother at `lg` because each step
   * around the ring is smaller. Clamped to 6–16 — below six the travelling
   * highlight stops reading as rotation, above sixteen the spokes merge.
   * @default 8
   */
  spokes?: number
  /**
   * Announced while the spinner is on screen. A spinner has no text node, so
   * without this it is silent to VoiceOver — which is the whole message.
   * @default 'Loading'
   */
  label?: string
  /**
   * Suppresses the live region, for a spinner inside an already-labelled
   * control (a button that sets `aria-busy`, say) where announcing twice is
   * worse than not announcing at all.
   */
  decorative?: boolean
}

/**
 * The iOS activity indicator.
 *
 * Deliberately the tapered-spoke design rather than a rotating arc: nothing
 * here rotates at all. Every spoke runs the same fade on the same cycle, offset
 * in time, so the bright one appears to travel around the ring. That is what
 * makes it recognisably Apple's, and it stays perfectly crisp at every size
 * because no edge is ever drawn at an intermediate angle.
 *
 * Under reduced motion the ring holds a static, evenly-lit state. A spinner is
 * the classic thing that gets *faster* rather than stopping when durations are
 * naively collapsed to near-zero, which strobes.
 */
export function Spinner({
  tone = 'neutral',
  size = 'md',
  spokes = 8,
  label = 'Loading',
  decorative = false,
  className,
  style,
  ...rest
}: SpinnerProps) {
  const count = Math.min(16, Math.max(6, Math.round(spokes)))

  return (
    <span
      {...rest}
      data-slot="spinner"
      data-tone={tone}
      data-size={size}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      className={cx('may-spinner', className)}
      style={{ ...style, '--may-spinner-count': count } as CSSProperties}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="may-spinner__spoke"
          // The index drives both the spoke's angle and its place in the fade
          // sequence, so the two can never drift out of step.
          style={{ '--may-spinner-i': index } as CSSProperties}
          aria-hidden
        />
      ))}
      {!decorative && <span className="may-sr-only">{label}</span>}
    </span>
  )
}
