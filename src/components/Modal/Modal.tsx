import type { HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import type { MayFooterLayout, MaySize } from '../../types'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
import { overlayTrigger, useExitDelay, useOpenState, useOverlay } from '../../overlay'

/** Matches the exit animation in Modal.css. */
const EXIT_MS = 150

/**
 * Extends `HTMLAttributes` so a consumer can attach the things every other
 * component already allows: `data-testid` for e2e, an `id`, extra `aria-*`,
 * a `ref`. `title` is omitted because this component means a heading by it,
 * not the HTML tooltip attribute.
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Controlled state. Omit it and the modal owns its own, which is what makes
   * `trigger` enough on its own.
   */
  open?: boolean
  /** Starting state when uncontrolled. @default false */
  defaultOpen?: boolean
  /** Fires on every change, controlled or not. */
  onOpenChange?: (open: boolean) => void
  /**
   * The control that opens it. A React element is cloned so the state lands on
   * the button you styled, and your own `onClick` still runs.
   */
  trigger?: ReactNode
  /** Called when the modal closes. Optional: an uncontrolled modal closes itself. */
  onClose?: () => void
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
  /**
   * The shared scale plus `'full'`, which the scale has no step for: a sheet
   * that takes the whole viewport is a different intent, not a fourth size.
   */
  size?: Exclude<MaySize, 'xs'> | 'full'
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
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger,
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
  const id = useAutoId()
  const { open, setOpen } = useOpenState({ open: openProp, defaultOpen, onOpenChange })
  /* Both paths, so a controlled caller's `onClose` still fires and an
   * uncontrolled one actually shuts. */
  const close = useCallback(() => {
    setOpen(false)
    onClose?.()
  }, [setOpen, onClose])
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
   *
   * Everything else — the gutter arithmetic, focus handover, Escape ownership
   * and inert containment — lives in `useOverlay`, so every overlay in the
   * package agrees on it.
   */
  const { panelRef } = useOverlay<HTMLDivElement>({
    open: mounted,
    onClose: close,
    closeOnEscape,
  })

  const onScrimDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (closeOnScrimClick) {
      close()
      return
    }
    // A click on the scrim of a modal that refuses to close would otherwise
    // drop focus onto <body>, and with it every key the trap depends on.
    panelRef.current?.focus()
  }

  const triggerNode =
    trigger === undefined
      ? null
      : overlayTrigger(trigger, {
          open,
          onToggle: () => setOpen(!open),
          controls: mounted ? `${id}-panel` : undefined,
          className: 'may-overlay__trigger may-pressable may-hoverable',
        })

  // Stays mounted for the length of its exit, so a dismissal animates instead
  // of blinking off the screen next to an entrance that springs.
  return (
    <>
      {triggerNode}
      {mounted && (
    <div
      className="may-modal__scrim"
      data-slot="scrim"
      data-state={open ? 'open' : 'closed'}
      onMouseDown={onScrimDown}
    >
      <div
        ref={panelRef}
        id={`${id}-panel`}
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
      )}
    </>
  )
}
