import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Alert.css'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode
  /** @default 'info' */
  tone?: AlertTone
  /** Bold first line. */
  title?: ReactNode
  /** @default 'soft' */
  variant?: 'soft' | 'outline'
  /** Replace the default tone icon, or pass `null` to drop it. */
  icon?: ReactNode | null
  /** When provided, renders a dismiss button that calls this. */
  onDismiss?: () => void
  /** Accessible name for the dismiss button. @default 'Dismiss' */
  dismissLabel?: string
  /** Trailing actions, rendered under the message. */
  actions?: ReactNode
}

const icons: Record<AlertTone, ReactNode> = {
  info: (
    <path d="M12 8h.01M11 12h1v4h1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  success: (
    <path d="M8 12.5l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  warning: (
    <path d="M12 8v5M12 16h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  danger: (
    <path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  neutral: (
    <path d="M12 8h.01M11 12h1v4h1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
}

/** An inline message about the state of the page or a recent action. */
export function Alert({
  children,
  tone = 'info',
  title,
  variant = 'soft',
  icon,
  onDismiss,
  dismissLabel = 'Dismiss',
  actions,
  className,
  ...rest
}: AlertProps) {
  const showIcon = icon !== null
  return (
    <div
      {...rest}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('may-alert', `may-alert--tone-${tone}`, `may-alert--${variant}`, className)}
    >
      {showIcon && (
        <span className="may-alert__icon" aria-hidden>
          {icon ?? (
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
              {icons[tone]}
            </svg>
          )}
        </span>
      )}
      <div className="may-alert__content">
        {title && <p className="may-alert__title">{title}</p>}
        {children && <div className="may-alert__message">{children}</div>}
        {actions && <div className="may-alert__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="may-alert__dismiss" onClick={onDismiss} aria-label={dismissLabel}>
          <svg viewBox="0 0 16 16" aria-hidden focusable="false">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
