import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize } from '../../types'
import './Pagination.css'

/** xs is absent: a pager key that small stops being a touch target. */
export type PaginationSize = Exclude<MaySize, 'xs'>

/** A rendered slot: a page number, or a gap standing in for the pages between. */
type Slot = number | 'gap-start' | 'gap-end'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The current page, 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** How many pages to show either side of the current one. @default 1 */
  siblingCount?: number
  /** @default 'md' */
  size?: PaginationSize
  /**
   * Collapse to "Page 3 of 12" between the two arrows. Twelve keys do not fit
   * across a phone, and a pager that scrolls sideways is worse than one that
   * counts.
   */
  compact?: boolean
  /** Accessible name for the pager. @default 'Pagination' */
  'aria-label'?: string
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)

/**
 * Which keys to draw.
 *
 * The row is always the same width: two pinned ends and a run of pages between
 * them, with the spare slot at either end turning into a gap when there is
 * more beyond it. A pager that reflows under the finger as the ellipsis
 * appears and disappears is exactly what that constant width avoids.
 *
 * Because the gap swallows the page it replaced, it never stands in for a
 * single number — an ellipsis hiding one page is a lie that costs a tap.
 */
function slotsFor(page: number, pageCount: number, siblingCount: number): Slot[] {
  // first + last + both gaps + the current page and its siblings
  const windowSize = siblingCount * 2 + 5
  if (pageCount <= windowSize) return range(1, pageCount)

  const span = windowSize - 3
  let start = page - siblingCount - 1
  let end = page + siblingCount + 1
  // Pinned to whichever end the window has run past, keeping its length.
  if (start < 2) {
    start = 2
    end = start + span
  } else if (end > pageCount - 1) {
    end = pageCount - 1
    start = end - span
  }

  const middle: Slot[] = range(start, end)
  if (start > 2) middle[0] = 'gap-start'
  if (end < pageCount - 1) middle[middle.length - 1] = 'gap-end'

  return [1, ...middle, pageCount]
}

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d={back ? 'M10 3.5L5.5 8L10 12.5' : 'M6 3.5L10.5 8L6 12.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface KeyProps {
  children: ReactNode
  label: string
  current?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

/** One key of the pager. Always a real `<button>`. */
function PagerKey({ children, label, current = false, disabled = false, onClick, className }: KeyProps) {
  const { pressProps } = usePressFeedback(disabled)

  return (
    <button
      {...pressProps}
      type="button"
      // The visible digit is not the accessible name: "4" alone tells a screen
      // reader nothing about what pressing it does.
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cx('may-pagination__key', 'may-pressable', 'may-hoverable', className)}
    >
      <span className="may-pagination__digit">{children}</span>
    </button>
  )
}

/**
 * A numeric pager.
 *
 * The current page is a **fill**, never an outline — and the fill scales in on
 * a bouncy spring as it lands, so paging reads as the selection jumping to a
 * new key rather than two colours swapping.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  compact = false,
  className,
  'aria-label': ariaLabel = 'Pagination',
  ...rest
}: PaginationProps) {
  const total = Math.max(1, Math.floor(pageCount))
  const current = Math.min(Math.max(1, Math.floor(page)), total)

  const go = (next: number) => {
    const clamped = Math.min(Math.max(1, next), total)
    if (clamped !== current) onPageChange(clamped)
  }

  const previous = (
    <li className="may-pagination__item">
      <PagerKey
        label="Previous page"
        disabled={current <= 1}
        onClick={() => go(current - 1)}
        className="may-pagination__arrow"
      >
        <Chevron back />
      </PagerKey>
    </li>
  )

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      data-slot="pagination"
      data-size={size}
      data-compact={compact ? 'true' : undefined}
      className={cx('may-pagination', className)}
    >
      <ul className="may-pagination__list">
        {previous}

        {compact ? (
          <li className="may-pagination__item">
            {/* Polite, not assertive: the count is a confirmation, not an alert. */}
            <span className="may-pagination__status" aria-live="polite">
              Page {current} of {total}
            </span>
          </li>
        ) : (
          slotsFor(current, total, siblingCount).map((slot) =>
            typeof slot === 'number' ? (
              <li key={slot} className="may-pagination__item">
                <PagerKey
                  label={slot === current ? `Page ${slot}, current page` : `Go to page ${slot}`}
                  current={slot === current}
                  onClick={() => go(slot)}
                  className="may-pagination__page"
                >
                  {slot}
                </PagerKey>
              </li>
            ) : (
              <li key={slot} className="may-pagination__item">
                <span className="may-pagination__gap" aria-hidden>
                  &#8230;
                </span>
              </li>
            ),
          )
        )}

        <li className="may-pagination__item">
          <PagerKey
            label="Next page"
            disabled={current >= total}
            onClick={() => go(current + 1)}
            className="may-pagination__arrow"
          >
            <Chevron />
          </PagerKey>
        </li>
      </ul>
    </nav>
  )
}
