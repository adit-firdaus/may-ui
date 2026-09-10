import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Statistic.css'

/** Which way the metric moved. `flat` is not "no delta" — it is "unchanged". */
export type StatisticDirection = 'up' | 'down' | 'flat'

export type StatisticSize = 'sm' | 'md' | 'lg'

export interface StatisticProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  /** The number itself. Set in tabular figures so a ticking value cannot jitter. */
  value: ReactNode
  /** Trailing unit, set smaller and lighter than the value — "1,284 **kcal**". */
  unit?: ReactNode
  /** The change, already formatted: "+12.4%", "3 bpm". */
  delta?: ReactNode
  /** @default 'flat' */
  direction?: StatisticDirection
  /**
   * Some metrics improve as they fall — resting heart rate, page weight, time
   * to first byte. This flips which direction is coloured green.
   */
  invertDelta?: boolean
  /** Trailing element, typically an `IconTile`. */
  trailing?: ReactNode
  /** @default 'md' */
  size?: StatisticSize
  /** `card` gives it the elevated surface a Health tile sits on. @default 'plain' */
  variant?: 'plain' | 'card'
}

/**
 * A single metric: label, value, and how it moved.
 *
 * The value is set in SF Rounded with tabular figures, which is what Fitness,
 * Health and the Batteries widget all do — rounded numerals read as a readout
 * rather than as body copy, and tabular figures stop a live value from
 * shivering as its digits change width.
 *
 * The arrow rotates between directions on a spring rather than swapping glyph,
 * so a metric that flips from rising to falling shows you the turn.
 */
export function Statistic({
  label,
  value,
  unit,
  delta,
  direction = 'flat',
  invertDelta = false,
  trailing,
  size = 'md',
  variant = 'plain',
  className,
  ...rest
}: StatisticProps) {
  // Colour tracks *goodness*, not geometry: down is green for a metric that is
  // supposed to fall.
  const sentiment =
    direction === 'flat' ? 'flat' : (direction === 'up') !== invertDelta ? 'positive' : 'negative'

  return (
    <div
      {...rest}
      data-slot="statistic"
      data-variant={variant}
      data-size={size}
      className={cx('may-statistic', className)}
    >
      <div className="may-statistic__text">
        <span className="may-statistic__label">{label}</span>
        <span className="may-statistic__value">
          {value}
          {unit != null && <span className="may-statistic__unit">{unit}</span>}
        </span>
        {delta != null && (
          <span
            className="may-statistic__delta"
            data-direction={direction}
            data-sentiment={sentiment}
          >
            <svg
              className="may-statistic__arrow"
              viewBox="0 0 12 12"
              aria-hidden
              focusable="false"
            >
              <path d="M6 2.2L10 7.4H2z" fill="currentColor" />
            </svg>
            {/* The arrow is decoration; the direction still has to be spoken. */}
            <span className="may-sr-only">
              {direction === 'up' ? 'Up ' : direction === 'down' ? 'Down ' : 'Unchanged, '}
            </span>
            {delta}
          </span>
        )}
      </div>
      {trailing && <span className="may-statistic__trailing">{trailing}</span>}
    </div>
  )
}
