import { cx } from '../../utils/cx'
import './Pagination.css'

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number
  /** Total number of pages. */
  pageCount: number
  /** Fires with the newly selected page. */
  onPageChange: (page: number) => void
  /** How many page numbers to show around the current one. @default 1 */
  siblingCount?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  /** @default 'Pagination' */
  'aria-label'?: string
  className?: string
}

const ELLIPSIS = 'ellipsis' as const
type PageEntry = number | typeof ELLIPSIS

/** Build the visible page list: always the first and last page, plus a window. */
function buildRange(page: number, pageCount: number, siblingCount: number): PageEntry[] {
  const total = siblingCount * 2 + 5
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const left = Math.max(page - siblingCount, 1)
  const right = Math.min(page + siblingCount, pageCount)
  const showLeftEllipsis = left > 2
  const showRightEllipsis = right < pageCount - 1

  const entries: PageEntry[] = [1]
  if (showLeftEllipsis) entries.push(ELLIPSIS)
  for (let i = Math.max(left, 2); i <= Math.min(right, pageCount - 1); i++) entries.push(i)
  if (showRightEllipsis) entries.push(ELLIPSIS)
  entries.push(pageCount)
  return entries
}

/** Page-by-page navigation for a long list. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Pagination',
}: PaginationProps) {
  if (pageCount <= 1) return null
  const entries = buildRange(page, pageCount, siblingCount)

  return (
    <nav aria-label={ariaLabel} className={cx('may-pagination', `may-pagination--${size}`, className)}>
      <button
        type="button"
        className="may-pagination__nav"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <svg viewBox="0 0 16 16" aria-hidden focusable="false">
          <path d="M10 4L6 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <ul className="may-pagination__list">
        {entries.map((entry, index) =>
          entry === ELLIPSIS ? (
            <li key={`gap-${index}`} className="may-pagination__ellipsis" aria-hidden>
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                className={cx('may-pagination__page', entry === page && 'may-pagination__page--current')}
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}`}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="may-pagination__nav"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <svg viewBox="0 0 16 16" aria-hidden focusable="false">
          <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  )
}
