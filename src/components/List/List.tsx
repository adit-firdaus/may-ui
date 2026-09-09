import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import './List.css'

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Section header, rendered above the card in the iOS grouped style. */
  header?: ReactNode
  /** Muted explanatory text below the card. */
  footer?: ReactNode
  /**
   * `inset` is the iOS Settings look — a rounded elevated card. `plain` is
   * full-bleed with no card, for edge-to-edge lists.
   * @default 'inset'
   */
  variant?: 'inset' | 'plain'
}

/**
 * A grouped inset list.
 *
 * Rows share one rounded card with hairlines between them, rather than each
 * being its own floating card — which is what makes eight rows read as one
 * thing instead of eight. The hairline is inset from the leading edge so it
 * starts under the label, exactly as iOS draws it.
 */
export function List({
  children,
  header,
  footer,
  variant = 'inset',
  className,
  ...rest
}: ListProps) {
  return (
    <div className={cx('may-list-group', className)}>
      {header && <div className="may-list__header">{header}</div>}
      <div {...rest} data-slot="list" data-variant={variant} className="may-list" role="list">
        {children}
      </div>
      {footer && <div className="may-list__footer">{footer}</div>}
    </div>
  )
}

export interface ListRowProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  /** Primary line. */
  title: ReactNode
  /** Secondary line under the title. */
  subtitle?: ReactNode
  /** Leading element — typically an `IconTile` or an `Avatar`. */
  leading?: ReactNode
  /** Trailing value, shown muted before the chevron. */
  detail?: ReactNode
  /** Trailing control such as a `Switch`. Suppresses the chevron. */
  accessory?: ReactNode
  /** Makes the row activatable. Renders a real `<button>`. */
  onClick?: () => void
  /** Show the disclosure chevron. Defaults to true when `onClick` is set. */
  chevron?: boolean
  /** Tint the title, for destructive rows like "Delete Account". */
  destructive?: boolean
  disabled?: boolean
}

/**
 * One row.
 *
 * When `onClick` is set this renders a real `<button>`, not a div with a click
 * handler — a div is invisible to keyboard and switch-access users, who have
 * no way to focus or activate it.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  detail,
  accessory,
  onClick,
  chevron,
  destructive = false,
  disabled = false,
  className,
  ...rest
}: ListRowProps) {
  const interactive = Boolean(onClick)
  const showChevron = chevron ?? (interactive && !accessory)
  const { pressProps } = usePressFeedback(disabled || !interactive)

  const content = (
    <>
      {leading && <span className="may-list-row__leading">{leading}</span>}
      <span className="may-list-row__text">
        <span className="may-list-row__title">{title}</span>
        {subtitle && <span className="may-list-row__subtitle">{subtitle}</span>}
      </span>
      {detail && <span className="may-list-row__detail">{detail}</span>}
      {accessory && <span className="may-list-row__accessory">{accessory}</span>}
      {showChevron && (
        <svg className="may-list-row__chevron" viewBox="0 0 16 16" aria-hidden focusable="false">
          <path
            d="M6 3.5L10.5 8L6 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  )

  const shared = {
    'data-slot': 'list-row',
    'data-destructive': destructive ? ('true' as const) : undefined,
    className: cx('may-list-row', interactive && 'may-hoverable', className),
    role: 'listitem',
  }

  if (!interactive) {
    return (
      <div {...rest} {...shared}>
        {content}
      </div>
    )
  }

  return (
    <button
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
      {...shared}
      {...pressProps}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}
