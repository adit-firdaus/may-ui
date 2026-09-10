import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { IoClose } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import type { MayFooterLayout } from '../../types'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
/* The overlay lifetime helper lives with Popover, which is where every other
 * dismissable surface takes it from. */
import { useExitDelay } from '../Popover/Popover'
import './Modal.css'

/** Matches the exit animation in Modal.css. */
const EXIT_MS = 150

/**
 * Extends `HTMLAttributes` so a consumer can attach the things every other
 * component already allows: `data-testid` for e2e, an `id`, extra `aria-*`,
 * a `ref`. `title` is omitted because this component means a heading by it,
 * not the HTML tooltip attribute.
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean
  onClose: () => void
  children?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Action row. On a phone its children stack full-width; on desktop they sit inline. */
  footer?: ReactNode
  /**
   * How the footer lays its actions out. `'end'` (the default) is today's
   * behaviour: content-sized, pinned to the trailing edge. `'stack'` is the
   * native phone shape — a column of full-width actions, primary first, which
   * is what a single "Save" almost always wants instead of a small pill in the
   * corner. `'fill'` keeps one row and shares the width equally.
   * @default 'end'
   */
  footerLayout?: MayFooterLayout
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Render the close chip in the top-trailing corner. @default true */
  closeButton?: boolean
  /** Accessible name for the close chip. @default 'Close' */
  closeLabel?: string
  /** @default true */
  closeOnScrimClick?: boolean
  /** @default true */
  closeOnEscape?: boolean
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A centred dialog.
 *
 * The one thing that separates it from `Sheet`: a modal keeps its shape at
 * every width. A sheet reshapes into a bottom sheet on phones because it is a
 * *presentation* — somewhere you go. A modal is an *interruption*, and an
 * interruption that slides in from the bottom edge reads as dismissible when
 * it very often is not.
 *
 * Entry rides `--may-spring-bouncy`, whose samples pass 1.16, so the panel
 * scales past its resting size and settles rather than simply appearing.
 */
export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  footer,
  footerLayout = 'end',
  size = 'md',
  closeButton = true,
  closeLabel = 'Close',
  closeOnScrimClick = true,
  closeOnEscape = true,
  className,
  ...rest
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const id = useAutoId()
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)
  const { pressProps } = usePressFeedback()

  /*
   * Keyed to `mounted`, not `open`. The scroll lock hands the page's scrollbar
   * width back as body padding; releasing it the moment `open` flips would put
   * the scrollbar back while the panel is still animating out, and the viewport
   * narrowing under it makes the dialog's width visibly snap mid-exit. Holding
   * the lock until the tree actually unmounts keeps the geometry still.
   */
  useEffect(() => {
    if (!mounted) return
    const panel = panelRef.current
    restoreTo.current = document.activeElement as HTMLElement | null

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    // Hiding the page's scrollbar widens the viewport by exactly its width, and
    // the whole layout jumps sideways behind the scrim unless that width is
    // handed back as padding. Nested overlays measure 0 here, so they add none.
    const gutter = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    // Focus the dialog itself rather than its first focusable: that first
    // focusable is very often a destructive footer action, and landing on it
    // makes a stray Return key destructive. A consumer that wants a specific
    // control focused marks it `autoFocus`, which React honours during commit —
    // before this effect runs, which is why the containment check comes first.
    if (panel && !panel.contains(document.activeElement)) panel.focus()

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      restoreTo.current?.focus?.()
    }
  }, [mounted])

  /*
   * Keys are handled on the scrim rather than on `document`. Both overlays in a
   * stack would otherwise hear the same Escape, and the outer one — registered
   * first — would win, closing the parent out from under its own child. Focus
   * is trapped inside the panel, so every key the dialog cares about bubbles
   * through here first, and `stopPropagation` lets the innermost one claim it.
   */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!closeOnEscape) return
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
  }

  const onScrimDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (closeOnScrimClick) {
      onClose()
      return
    }
    // A click on the scrim of a modal that refuses to close would otherwise
    // drop focus onto <body>, and with it every key the trap depends on.
    panelRef.current?.focus()
  }

  // Stays mounted for the length of its exit, so a dismissal animates instead
  // of blinking off the screen next to an entrance that springs.
  if (!mounted) return null

  return (
    <div
      className="may-modal__scrim"
      data-slot="scrim"
      data-state={open ? 'open' : 'closed'}
      onMouseDown={onScrimDown}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        data-slot="modal"
        data-state={open ? 'open' : 'closed'}
        data-size={size}
        data-presentation={isDesktop ? 'desktop' : 'compact'}
        data-closable={closeButton ? 'true' : undefined}
        {...rest}
        className={cx('may-modal', className)}
      >
        {closeButton && (
          <button
            {...pressProps}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            data-slot="modal-close"
            className="may-modal__close may-pressable may-hoverable"
          >
            {/* xmark — the chip behind it is smaller than the button, so the
                glyph stays iOS-sized while the tap target stays a full 44pt. */}
            <span className="may-modal__close-chip" aria-hidden>
              <IoClose focusable="false" />
            </span>
          </button>
        )}

        {(title || description) && (
          <header className="may-modal__header">
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
          </header>
        )}

        {children && (
          <div className="may-modal__body" data-slot="scroll-area">
            {children}
          </div>
        )}

        {footer && (
          <footer className="may-modal__footer" data-footer={footerLayout}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
