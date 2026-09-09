import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Drawer.css'

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
  /** Which edge the panel slides in from. @default 'right' */
  side?: DrawerSide
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  /** @default true */
  showCloseButton?: boolean
  /** @default true */
  closeOnBackdropClick?: boolean
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** A panel that slides in from an edge. Same semantics as `Modal`. */
export function Drawer({
  open,
  onClose,
  children,
  side = 'right',
  size = 'md',
  title,
  description,
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const id = useAutoId()

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]!
      const last = nodes[nodes.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)
    const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current
    target?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      restoreTo.current?.focus?.()
    }
  }, [open, onKeyDown])

  if (!open) return null

  return (
    <div
      className="may-drawer__backdrop"
      onMouseDown={(event) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        className={cx('may-drawer', `may-drawer--${side}`, `may-drawer--${size}`, className)}
      >
        {(title || showCloseButton) && (
          <div className="may-drawer__header">
            <div className="may-drawer__titles">
              {title && (
                <h2 className="may-drawer__title" id={`${id}-title`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="may-drawer__description" id={`${id}-description`}>
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button type="button" className="may-drawer__close" onClick={onClose} aria-label="Close panel">
                <svg viewBox="0 0 16 16" aria-hidden focusable="false">
                  <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}
        {children && <div className="may-drawer__body">{children}</div>}
        {footer && <div className="may-drawer__footer">{footer}</div>}
      </div>
    </div>
  )
}
