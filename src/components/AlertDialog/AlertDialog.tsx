import type { HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useRef } from 'react'
import { cx } from '../../utils/cx'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
import { Button } from '../Button'
/* The overlay lifetime helper lives with Popover, which is where every other
 * dismissable surface takes it from. */
import { useExitDelay, useOverlay } from '../../overlay'

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
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const id = useAutoId()
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)

  /*
   * Keyed to `mounted`, not `open`: holding the scroll lock until the tree
   * actually unmounts keeps the geometry still through the exit.
   *
   * A destructive alert opens on Cancel. A Return key pressed before the
   * sentence has even been read must not be the one that deletes something —
   * which is why the initial focus is passed in rather than left to the
   * shared default.
   */
  const { panelRef } = useOverlay<HTMLDivElement>({
    open: mounted,
    onClose: onCancel,
    initialFocus: () => (destructive ? cancelRef.current : confirmRef.current),
  })

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
