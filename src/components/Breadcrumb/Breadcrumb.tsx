import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Breadcrumb.css'

export interface BreadcrumbItem {
  label: ReactNode
  /** Omit on the final item — it renders as the current page. */
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  /** Ordered trail, root first. */
  items: BreadcrumbItem[]
  /** Custom separator between items. @default a chevron */
  separator?: ReactNode
  /** Collapse the middle when there are more items than this. */
  maxItems?: number
  /** @default 'Breadcrumb' */
  'aria-label'?: string
  className?: string
}

/** Shows where the current page sits in the hierarchy. */
export function Breadcrumb({
  items,
  separator,
  maxItems,
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbProps) {
  const collapsed =
    maxItems && items.length > maxItems
      ? [items[0]!, { label: '…' } as BreadcrumbItem, ...items.slice(-(maxItems - 2))]
      : items

  return (
    <nav aria-label={ariaLabel} className={cx('may-breadcrumb', className)}>
      <ol className="may-breadcrumb__list">
        {collapsed.map((item, index) => {
          const isLast = index === collapsed.length - 1
          return (
            <li key={index} className="may-breadcrumb__item">
              {isLast || (!item.href && !item.onClick) ? (
                <span
                  className={cx('may-breadcrumb__current')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a className="may-breadcrumb__link" href={item.href} onClick={item.onClick}>
                  {item.label}
                </a>
              )}
              {!isLast && (
                <span className="may-breadcrumb__separator" aria-hidden>
                  {separator ?? (
                    <svg viewBox="0 0 16 16" focusable="false">
                      <path
                        d="M6 4l4 4-4 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
