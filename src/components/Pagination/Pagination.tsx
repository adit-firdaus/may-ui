import type { HTMLAttributes, ReactNode } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useSlidingThumb } from '../../motion/useSlidingThumb'
import type { MaySize } from '../../types'

/** The key lifts a little under the press, the way a segmented thumb does. */
const PRESS_SCALE = 1.14

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

interface KeyProps {
  children: ReactNode
  label: string
  current?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
  keyRef?: (node: HTMLButtonElement | null) => void
}

/** One key of the pager. Always a real `<button>`. */
function PagerKey({
  children,
  label,
  current = false,
  disabled = false,
  onClick,
  className,
  keyRef,
}: KeyProps) {
  const { pressProps } = usePressFeedback(disabled)

  return (
    <button
      {...pressProps}
      ref={keyRef}
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

  const slots = compact ? [] : slotsFor(current, total, siblingCount)

  /*
   * A filled key that SLIDES between slot positions instead of one key's fill
   * springing in as another's springs out. The thumb tracks the slot the
   * current page occupies, not the page number: the row of slots is a fixed
   * width, so when the window shifts the digits scroll under a thumb that holds
   * its place — and when the current page walks toward an end, the thumb slides
   * with it. Press-only: a page is tapped, not scrubbed. Inert when compact,
   * which draws no keys at all.
   */
  const { trackRef, thumbRef, registerItem, onPointerDown } = useSlidingThumb<
    HTMLUListElement,
    HTMLButtonElement
  >({
    itemCount: slots.length,
    selectedIndex: slots.findIndex((slot) => slot === current),
    roundEnds: true,
    pressScale: PRESS_SCALE,
    enabled: !compact,
  })

  const previous = (
    <li className="may-pagination__item">
      <PagerKey
        label="Previous page"
        disabled={current <= 1}
        onClick={() => go(current - 1)}
        className="may-pagination__arrow"
      >
        <IoChevronBack aria-hidden focusable="false" />
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
      <ul ref={trackRef} className="may-pagination__list" onPointerDown={onPointerDown}>
        {/* The sliding fill. First child so it paints beneath the keys; a bare
          * span in a list is furniture, hidden from the tree. */}
        {!compact && <span ref={thumbRef} className="may-pagination__thumb" aria-hidden />}
        {previous}

        {compact ? (
          <li className="may-pagination__item">
            {/* Polite, not assertive: the count is a confirmation, not an alert. */}
            <span className="may-pagination__status" aria-live="polite">
              Page {current} of {total}
            </span>
          </li>
        ) : (
          slots.map((slot, index) =>
            typeof slot === 'number' ? (
              <li key={slot} className="may-pagination__item">
                <PagerKey
                  keyRef={registerItem(index)}
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
            <IoChevronForward aria-hidden focusable="false" />
          </PagerKey>
        </li>
      </ul>
    </nav>
  )
}
