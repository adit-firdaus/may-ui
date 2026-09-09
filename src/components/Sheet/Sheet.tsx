import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
import { clampWithRubber, draggable, projectFlick } from '../../motion/gesture'
import './Sheet.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Show the drag grabber on the phone presentation. @default true */
  grabber?: boolean
  /** Allow dragging the sheet down to dismiss it. @default true */
  dismissible?: boolean
  closeOnScrimClick?: boolean
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Past this fraction of its own height, releasing dismisses rather than snapping back. */
const DISMISS_RATIO = 0.35
/** A decisive downward flick dismisses even from near the top. */
const DISMISS_VELOCITY = 0.5

/**
 * A sheet.
 *
 * One component, two shapes: it rises from the bottom edge on phones, with a
 * grabber and drag-to-dismiss, and presents as a centred dialog on desktop.
 * The consumer writes it once.
 *
 * The drag is real: the sheet tracks the finger with rubber-band resistance
 * upward, and on release it decides using both distance and projected flick
 * velocity, so a short fast swipe dismisses the way it does natively.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  description,
  footer,
  size = 'md',
  grabber = true,
  dismissible = true,
  closeOnScrimClick = true,
  className,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const id = useAutoId()
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const [dragging, setDragging] = useState(false)

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

  /* Drag-to-dismiss. Phone presentation only — a centred dialog has no edge to drag from. */
  useEffect(() => {
    const panel = panelRef.current
    if (!open || !panel || isDesktop || !dismissible || reducedMotion) return

    let height = panel.offsetHeight

    return draggable(panel, {
      axis: 'y',
      onStart: () => {
        height = panel.offsetHeight
        setDragging(true)
        panel.style.transition = 'none'
      },
      onMove: ({ dy }) => {
        // Downward is free; upward meets rubber-band resistance so the sheet
        // never detaches from the bottom edge.
        panel.style.transform = `translateY(${clampWithRubber(dy, 0, Number.POSITIVE_INFINITY)}px)`
      },
      onEnd: ({ dy, vy }) => {
        setDragging(false)
        panel.style.transition = ''
        const projected = dy + projectFlick(vy)
        const dismiss = projected > height * DISMISS_RATIO || vy > DISMISS_VELOCITY
        panel.style.transform = ''
        if (dismiss) onClose()
      },
    })
  }, [open, isDesktop, dismissible, reducedMotion, onClose])

  if (!open) return null

  const presentation = isDesktop ? 'dialog' : 'sheet'

  return (
    <div
      className="may-sheet__scrim"
      data-slot="scrim"
      data-presentation={presentation}
      onMouseDown={(event) => {
        if (closeOnScrimClick && event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        data-slot="sheet"
        data-presentation={presentation}
        data-size={size}
        data-dragging={dragging ? 'true' : undefined}
        className={cx('may-sheet', className)}
      >
        {grabber && !isDesktop && dismissible && (
          <span className="may-sheet__grabber" aria-hidden />
        )}
        {(title || description) && (
          <header className="may-sheet__header">
            {title && (
              <h2 className="may-sheet__title" id={`${id}-title`}>
                {title}
              </h2>
            )}
            {description && (
              <p className="may-sheet__description" id={`${id}-description`}>
                {description}
              </p>
            )}
          </header>
        )}
        {children && (
          <div className="may-sheet__body" data-slot="scroll-area">
            {children}
          </div>
        )}
        {footer && <footer className="may-sheet__footer">{footer}</footer>}
      </div>
    </div>
  )
}
