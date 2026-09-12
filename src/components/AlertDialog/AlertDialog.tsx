import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
import { Button } from '../Button'
/* The overlay lifetime helper lives with Popover, which is where every other
 * dismissable surface takes it from. */
import { useExitDelay } from '../Popover/Popover'

/** Matches the exit animation in AlertDialog.css. */
const EXIT_MS = 150

/**
 * Extends `HTMLAttributes` so a consumer can attach the things every other
 * component already allows: `data-testid` for e2e, an `id`, extra `aria-*`,
 * a `ref`. `title` is omitted because this component means a heading by it,
 * not the HTML tooltip attribute.
 */
export interface AlertDialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean
  /** The question, phrased as one. "Delete this album?" */
  title: ReactNode
  /** The consequence. One or two sentences at most. */
  description?: ReactNode
  /** @default 'OK' */
  confirmLabel?: string
  /** @default 'Cancel' */
  cancelLabel?: string
  /** Paints the confirm button destructive and opens with Cancel focused. */
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Extra content between the description and the actions. Use sparingly. */
  children?: ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Confirm, or confirm something destructive.
 *
 * Small, centred, and — unlike `Modal` — not dismissible by clicking away.
 * An alert exists because there is a decision that has to be made, and a click
 * on the scrim is not one of the two answers. It nudges instead, the way an
 * NSAlert does, which reads as "I heard you, but pick one".
 *
 * The only shape that adapts is the action row: full-width and stacked on a
 * phone with the confirming action on top, two equal halves on desktop.
 */
export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  children,
  className,
  ...rest
}: AlertDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const id = useAutoId()
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)

  /*
   * Keyed to `mounted`, not `open`. The scroll lock hands the page's scrollbar
   * width back as body padding; releasing it the moment `open` flips would put
   * the scrollbar back while the panel is still animating out, and the viewport
   * narrowing under it makes the dialog's width visibly snap mid-exit. Holding
   * the lock until the tree actually unmounts keeps the geometry still.
   */
  useEffect(() => {
    if (!mounted) return
    restoreTo.current = document.activeElement as HTMLElement | null

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    // Hiding the scrollbar widens the viewport by its own width; handing that
    // width back as padding is what stops the page lurching sideways.
    const gutter = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    // A destructive alert opens on Cancel. A Return key pressed before the
    // sentence has even been read must not be the one that deletes something.
    const initial = destructive ? cancelRef.current : confirmRef.current
    initial?.focus()

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      restoreTo.current?.focus?.()
    }
  }, [mounted, destructive])

  /**
   * Restart the nudge from zero. Setting the attribute again while the
   * animation is still running does nothing — the browser sees no change — so
   * the attribute is removed and layout is read to flush that removal first.
   */
  const nudge = () => {
    const panel = panelRef.current
    if (!panel) return
    panel.removeAttribute('data-nudge')
    void panel.offsetWidth
    panel.setAttribute('data-nudge', 'true')
  }

  /*
   * Keys are handled here rather than on `document`, so an alert raised from
   * inside a sheet or a modal claims its own Escape instead of letting the
   * outer overlay — which registered its listener first — close them both.
   */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
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
    nudge()
    // The click also dropped focus onto <body>, taking the key trap with it.
    panelRef.current?.focus()
  }

  // Stays mounted for the length of its exit, so a dismissal animates instead
  // of blinking off the screen next to an entrance that springs.
  if (!mounted) return null

  return (
    <div
      className="may-alert-dialog__scrim"
      data-slot="scrim"
      data-state={open ? 'open' : 'closed'}
      onMouseDown={onScrimDown}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        data-slot="alert-dialog"
        data-state={open ? 'open' : 'closed'}
        data-presentation={isDesktop ? 'desktop' : 'compact'}
        data-destructive={destructive ? 'true' : undefined}
        // Clears the flag once the shake finishes, so the next one can start it
        // again. The entry animation trips this too, harmlessly.
        onAnimationEnd={() => panelRef.current?.removeAttribute('data-nudge')}
        {...rest}
        className={cx('may-alert-dialog', className)}
      >
        <div className="may-alert-dialog__content" data-slot="scroll-area">
          <h2 className="may-alert-dialog__title" id={`${id}-title`}>
            {title}
          </h2>
          {description && (
            <p className="may-alert-dialog__description" id={`${id}-description`}>
              {description}
            </p>
          )}
          {children}
        </div>

        {/*
         * Cancel first in the DOM: desktop reads it left-to-right in that
         * order, and the phone shape reverses the column so the confirming
         * action lands on top — one CSS property instead of two trees.
         */}
        <div className="may-alert-dialog__actions">
          <Button ref={cancelRef} variant="gray" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            tone={destructive ? 'danger' : 'tint'}
            variant="filled"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
