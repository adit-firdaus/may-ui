import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Modal.css'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  /** Whether the dialog is shown. */
  open: boolean
  /** Called on Escape, backdrop click, or the close button. */
  onClose: () => void
  children?: ReactNode
  /** Title rendered in the header and used as the accessible name. */
  title?: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  /** @default 'md' */
  size?: ModalSize
  /** Footer content — typically the confirm and cancel buttons. */
  footer?: ReactNode
  /** Show the header close button. @default true */
  showCloseButton?: boolean
  /** Close when the backdrop is clicked. @default true */
  closeOnBackdropClick?: boolean
  /** Close on the Escape key. @default true */
  closeOnEscape?: boolean
  className?: string
}

/** Focusable elements considered for the focus trap. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A modal dialog. Traps focus, locks body scroll, and restores focus to the
 * element that opened it.
 */
export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const id = useAutoId()

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
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
    [closeOnEscape, onClose],
  )

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)

    const target =
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current ?? undefined
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
      className="may-modal__backdrop"
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
        className={cx('may-modal', `may-modal--${size}`, className)}
      >
        {(title || showCloseButton) && (
          <div className="may-modal__header">
            <div className="may-modal__titles">
              {title && (
                <h2 className="may-modal__title" id={`${id}-title`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="may-modal__description" id={`${id}-description`}>
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button type="button" className="may-modal__close" onClick={onClose} aria-label="Close dialog">
                <svg viewBox="0 0 16 16" aria-hidden focusable="false">
                  <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}
        {children && <div className="may-modal__body">{children}</div>}
        {footer && <div className="may-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
