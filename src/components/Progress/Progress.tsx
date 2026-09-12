import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import type { MaySize, MayTone } from '../../types'

/**
 * The ring is drawn in a 100×100 viewBox with `pathLength="100"`, so a dash
 * length IS a percentage and no circumference ever has to be computed. The
 * radius is 45 rather than 50 because a stroke straddles its path — half of it
 * falls outside — so the widest rung (10) still lands exactly on the edge.
 */
const RING_RADIUS = 45
const RING_LENGTH = 100

/** Clamp `value/max` into 0…1, tolerating the NaN a controlled input can hand us. */
function fraction(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0
  return Math.min(1, Math.max(0, value / max))
}

const percentOf = (value: number, max: number) => `${Math.round(fraction(value, max) * 100)}%`

interface ProgressCommonProps {
  /** @default 0 */
  value?: number
  /** @default 100 */
  max?: number
  /** Work is happening but its extent is unknown. `value` is ignored. */
  indeterminate?: boolean
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /** Render the percentage — beside the bar, inside the ring. */
  showValue?: boolean
  /**
   * Overrides the printed percentage AND `aria-valuetext`, so "8.2 MB of 24 MB"
   * is spoken as well as shown. A screen reader otherwise announces the raw
   * number, which for a byte count is meaningless.
   */
  formatValue?: (value: number, max: number) => string
}

export interface ProgressProps
  extends ProgressCommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label above the bar. Also becomes the bar's accessible name. */
  label?: ReactNode
}

/**
 * A determinate bar.
 *
 * The fill animates its `width` rather than a `scaleX`, which is the one place
 * this system prefers layout to the compositor: a scaled fill stretches its own
 * rounded caps into ellipses, and at a 4px bar that distortion is the entire
 * silhouette. The bar is short-lived and there is exactly one on screen, so the
 * layout cost buys a shape that stays right.
 *
 * The width rides `--may-spring-snappy`, so a jump from 20% to 80% overshoots a
 * hair and settles — the reason progress here reads as something arriving
 * rather than a number being assigned.
 */
export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  tone = 'tint',
  size = 'md',
  showValue = false,
  formatValue,
  label,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: ProgressProps) {
  const pct = fraction(value, max)
  const text = formatValue ? formatValue(value, max) : percentOf(value, max)
  const labelId = useAutoId()
  // An indeterminate bar has no percentage to print, so `showValue` alone must
  // not reserve a meta row that would sit there empty.
  const showsValue = showValue && !indeterminate
  const hasMeta = label != null || showsValue

  return (
    <div
      {...rest}
      data-slot="progress"
      data-tone={tone}
      data-size={size}
      data-indeterminate={indeterminate ? 'true' : undefined}
      className={cx('may-progress', className)}
      style={{ ...style, '--may-progress-pct': pct } as CSSProperties}
    >
      {hasMeta && (
        <div className="may-progress__meta">
          {label != null && (
            <span className="may-progress__label" id={labelId}>
              {label}
            </span>
          )}
          {showsValue && <span className="may-progress__value">{text}</span>}
        </div>
      )}
      <div
        className="may-progress__track"
        role="progressbar"
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label == null ? ariaLabel : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        // Omitting valuenow is what marks a progressbar indeterminate; a zero
        // there would be announced as "0 percent", which is a lie.
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={indeterminate ? undefined : text}
      >
        <div className="may-progress__fill" />
      </div>
    </div>
  )
}

export interface CircularProgressProps
  extends ProgressCommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Centre content — a glyph, a count, "3 of 8". Wins over `showValue`, since
   * the two would land on the same pixels.
   */
  children?: ReactNode
  /** Accessible name. The ring carries no visible label of its own. */
  'aria-label'?: string
}

/**
 * The same progress as a ring.
 *
 * iOS reaches for a ring at least as often as a bar — a download inside a row,
 * a workout, an upload on a photo tile — because a ring reads at a glance in a
 * square that a bar cannot fill.
 *
 * Indeterminate mode deliberately runs TWO animations at different periods: the
 * ring rotates while the arc breathes between a quarter and a half turn. Their
 * cycles do not divide into each other, so the loop never visibly repeats — a
 * single-period spinner starts to look stuck after a few seconds.
 */
export function CircularProgress({
  value = 0,
  max = 100,
  indeterminate = false,
  tone = 'tint',
  size = 'md',
  showValue = false,
  formatValue,
  children,
  className,
  ...rest
}: CircularProgressProps) {
  const pct = fraction(value, max)
  const text = formatValue ? formatValue(value, max) : percentOf(value, max)
  const centre = children ?? (showValue && !indeterminate ? text : undefined)

  return (
    <div
      {...rest}
      data-slot="circular-progress"
      data-tone={tone}
      data-size={size}
      data-indeterminate={indeterminate ? 'true' : undefined}
      className={cx('may-ring', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuetext={indeterminate ? undefined : text}
    >
      <svg className="may-ring__svg" viewBox="0 0 100 100" aria-hidden focusable="false">
        <circle className="may-ring__rail" cx="50" cy="50" r={RING_RADIUS} pathLength={RING_LENGTH} />
        <circle
          className="may-ring__fill"
          cx="50"
          cy="50"
          r={RING_RADIUS}
          pathLength={RING_LENGTH}
          // Left to CSS while indeterminate: the keyframes animate this very
          // property, and an inline value would be the thing they animate from.
          style={indeterminate ? undefined : { strokeDashoffset: RING_LENGTH - pct * RING_LENGTH }}
        />
      </svg>
      {centre != null && <span className="may-ring__centre">{centre}</span>}
    </div>
  )
}
