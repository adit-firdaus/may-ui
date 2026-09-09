import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import type { AlertTone } from '../Alert/Alert'
import './Toast.css'

export type ToastTone = AlertTone

export interface ToastOptions {
  /** Bold first line. */
  title: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** @default 'neutral' */
  tone?: ToastTone
  /** Auto-dismiss after this many ms. Pass `0` to keep it until dismissed. @default 5000 */
  duration?: number
  /** A single action, e.g. Undo. */
  action?: { label: string; onClick: () => void }
}

interface ToastRecord extends ToastOptions {
  id: number
}

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

interface ToastContextValue {
  /** Show a toast. Returns its id. */
  toast: (options: ToastOptions) => number
  /** Dismiss one toast by id. */
  dismiss: (id: number) => void
  /** Dismiss every visible toast. */
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Show toasts from anywhere inside `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

export interface ToastProviderProps {
  children?: ReactNode
  /** Where the stack is anchored. @default 'bottom-right' */
  position?: ToastPosition
  /** Maximum toasts on screen; the oldest is dropped past this. @default 4 */
  max?: number
}

/** Owns the toast queue and renders the viewport. Mount it once, near the root. */
export function ToastProvider({ children, position = 'bottom-right', max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    setToasts([])
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++
      const record: ToastRecord = { tone: 'neutral', duration: 5000, ...options, id }
      setToasts((current) => [...current, record].slice(-max))
      if (record.duration && record.duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), record.duration),
        )
      }
      return id
    },
    [dismiss, max],
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={cx('may-toast-viewport', `may-toast-viewport--${position}`)}>
        {toasts.map((entry) => (
          <Toast key={entry.id} {...entry} onDismiss={() => dismiss(entry.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export interface ToastProps extends ToastOptions {
  /** Called by the close button. */
  onDismiss?: () => void
  className?: string
}

/**
 * A single toast. Rendered for you by `ToastProvider` — use it directly only
 * when you need one in a static layout (a preview, a story).
 */
export function Toast({
  title,
  description,
  tone = 'neutral',
  action,
  onDismiss,
  className,
}: ToastProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      className={cx('may-toast', `may-toast--tone-${tone}`, className)}
    >
      <span className="may-toast__accent" aria-hidden />
      <div className="may-toast__content">
        <p className="may-toast__title">{title}</p>
        {description && <p className="may-toast__description">{description}</p>}
      </div>
      {action && (
        <button type="button" className="may-toast__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button type="button" className="may-toast__close" onClick={onDismiss} aria-label="Dismiss notification">
          <svg viewBox="0 0 16 16" aria-hidden focusable="false">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
