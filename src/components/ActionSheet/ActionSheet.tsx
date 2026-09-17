import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from 'react'
import { useCallback, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoId } from '../../utils/useId'
/* The overlay lifetime helper lives with Popover, which is where every other
 * dismissable surface takes it from. */
import { overlayTrigger, useExitDelay, useOpenState, useOverlay } from '../../overlay'
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect'

/** Matches the exit transition in ActionSheet.css. */
const EXIT_MS = 150

export interface ActionSheetAction {
  label: string
  onSelect: () => void
  /** Paints the row in the destructive colour. "Delete Photo", "Log Out". */
  destructive?: boolean
  disabled?: boolean
  /** Trailing glyph on a phone, leading glyph in the desktop menu. */
  icon?: ReactNode
}

export interface ActionSheetProps {
  /** Controlled state. Omit it and the sheet owns its own. */
  open?: boolean
  /** Starting state when uncontrolled. @default false */
  defaultOpen?: boolean
  /** Fires on every change, controlled or not. */
  onOpenChange?: (open: boolean) => void
  /** The control that opens it. A React element is cloned; your onClick still runs. */
  trigger?: ReactNode
  /** Called when it closes. Optional: an uncontrolled sheet closes itself. */
  onClose?: () => void
  /**
   * The rows. Named `items` to match every other list-taking component —
   * Menu, Breadcrumb, Steps, TabBar, CapsuleTabs, CommandPalette, ContextMenu.
   */
  items?: ActionSheetAction[]
  /**
   * @deprecated Use `items`. `actions` meant two different things in one entry
   * point — `ActionSheetAction[]` here and `ReactNode` on `Alert` — so the word
   * could not be read without knowing which component you were looking at.
   * Still honoured; `items` wins when both are passed.
   */
  actions?: ActionSheetAction[]
  title?: ReactNode
  description?: ReactNode
  /** Label of the phone shape's separate cancel group. @default 'Cancel' */
  cancelLabel?: string
  /**
   * Desktop only: the control the menu hangs from. Without it the menu
   * presents centred, the way a modal does.
   */
  anchorRef?: RefObject<HTMLElement | null>
  className?: string
}

/** Gap between the anchor and the menu, and the menu's minimum viewport margin, in px. */
const ANCHOR_GAP = 6
const VIEWPORT_MARGIN = 8

interface Placement {
  top: number
  left: number
  /** Which side of the anchor the menu ended up on — drives its transform origin. */
  side: 'top' | 'bottom'
}

/**
 * A list of actions, in whichever shape the pointer deserves.
 *
 * On a phone it is the authentic iOS action sheet: full-width rows in a rounded
 * group at the bottom edge, with Cancel as a *separate* group below. That gap
 * is not decoration — it is what stops a thumb reaching for Cancel from landing
 * on the destructive row above it.
 *
 * On desktop the same actions become an anchored menu. A 56pt full-width row is
 * absurd under a mouse, and a Cancel row is redundant when Escape and a click
 * anywhere else already cancel — so the desktop shape drops it.
 */
export function ActionSheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger,
  onClose,
  items,
  actions = [],
  title,
  description,
  cancelLabel = 'Cancel',
  anchorRef,
  className,
}: ActionSheetProps) {
  const id = useAutoId()
  const { open, setOpen } = useOpenState({ open: openProp, defaultOpen, onOpenChange })
  const close = useCallback(() => {
    setOpen(false)
    onClose?.()
  }, [setOpen, onClose])
  // `items` wins; `actions` is the deprecated spelling of the same list.
  const list = items ?? actions
  const isDesktop = useIsDesktop()
  const [placement, setPlacement] = useState<Placement | null>(null)
  const reducedMotion = useReducedMotion()
  // Stays mounted for the length of its exit, so a dismissal animates instead
  // of blinking off the screen next to an entrance that rises.
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)

  const menu = isDesktop
  // Derived from the measurement rather than from the ref, so the panel is
  // never rendered as "anchored" in a frame that has no coordinates for it.
  const anchored = placement !== null

  /**
   * Every enabled row, in visual order — what the arrow keys walk.
   *
   * Annotated because `useOverlay`'s `initialFocus` calls this while `panelRef`
   * is still being inferred from the same call, which is a cycle TypeScript
   * cannot resolve on its own.
   */
  const rows = (): HTMLButtonElement[] =>
    Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="action-sheet-action"]:not(:disabled)',
      ) ?? [],
    )

  /*
   * `menu` mode is modal in every other respect but deliberately takes neither
   * the scroll lock nor inert: it is a popover then, and hiding the page's
   * scrollbar to open a menu jolts the whole layout sideways.
   *
   * Menus put focus on their first item; so does the sheet, whose first row is
   * never the destructive one — iOS always sorts destructive actions last.
   */
  const { panelRef } = useOverlay<HTMLDivElement>({
    open: mounted,
    onClose: close,
    modal: !menu,
    initialFocus: () => rows()[0] ?? null,
  })

  /*
   * Anchored placement. Measured with offsetWidth/offsetHeight rather than a
   * bounding rect because the menu is mid-scale when this runs, and a rect
   * would report the animated size instead of the laid-out one.
   */
  useIsomorphicLayoutEffect(() => {
    const panel = panelRef.current
    const anchor = anchorRef?.current
    if (!open || !menu || !panel || !anchor) {
      setPlacement(null)
      return
    }

    const place = () => {
      const box = anchor.getBoundingClientRect()
      const height = panel.offsetHeight
      const width = panel.offsetWidth
      const below = window.innerHeight - box.bottom

      // Flip above only when below genuinely cannot hold the menu *and* above
      // holds more; a menu that flips at the first pixel of pressure jitters.
      const side: Placement['side'] =
        below < height + ANCHOR_GAP && box.top > below ? 'top' : 'bottom'

      const next: Placement = {
        side,
        top: side === 'bottom' ? box.bottom + ANCHOR_GAP : box.top - height - ANCHOR_GAP,
        // Menus hang from the anchor's leading edge and only slide inward when
        // that would put them past the viewport.
        left: Math.min(
          Math.max(VIEWPORT_MARGIN, box.left),
          Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
        ),
      }

      // Bail on an unchanged read. This runs on every scroll event of every
      // scrollable ancestor, and a fresh object each time would re-render the
      // whole menu for a position that has not moved a pixel.
      setPlacement((previous) =>
        previous &&
        previous.top === next.top &&
        previous.left === next.left &&
        previous.side === next.side
          ? previous
          : next,
      )
    }

    /*
     * A scroll inside the sheet's own list is not the anchor moving, and
     * re-placing on it means a getBoundingClientRect per scroll event for a
     * position that cannot have changed — a layout read on every frame of a
     * finger drag. ContextMenu guards its own scrollport the same way.
     */
    const onScroll = (event: Event) => {
      if (panel.contains(event.target as Node)) return
      place()
    }

    place()
    window.addEventListener('resize', place)
    // Capture, so an anchor inside a scrolling pane is tracked too.
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, menu, anchorRef, list.length])

  /*
   * Escape belongs to the layer stack, and containment to `inert`. What is left
   * here is the roving arrow navigation, which is this component's own.
   */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = rows()
    if (items.length === 0) return
    const index = items.indexOf(document.activeElement as HTMLButtonElement)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      items[(index + delta + items.length) % items.length]!.focus()
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      items[0]!.focus()
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]!.focus()
      return
    }

  }

  const onScrimDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close()
  }

  const presentation = menu ? 'menu' : 'sheet'
  const labelledBy = title ? `${id}-title` : undefined

  const triggerNode =
    trigger === undefined
      ? null
      : overlayTrigger(trigger, {
          open,
          onToggle: () => setOpen(!open),
          haspopup: menu ? 'menu' : 'dialog',
          controls: mounted ? `${id}-panel` : undefined,
          className: 'may-overlay__trigger may-pressable may-hoverable',
        })

  return (
    <>
      {triggerNode}
      {mounted && (
    <div
      className="may-action-sheet__scrim"
      data-slot="scrim"
      data-state={open ? 'open' : 'closed'}
      data-presentation={presentation}
      onMouseDown={onScrimDown}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        id={`${id}-panel`}
        role={menu ? 'menu' : 'dialog'}
        aria-modal={menu ? undefined : 'true'}
        aria-labelledby={labelledBy}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
        data-slot="action-sheet"
        data-state={open ? 'open' : 'closed'}
        data-presentation={presentation}
        data-anchored={anchored ? 'true' : undefined}
        data-side={placement?.side}
        style={placement ? { top: placement.top, left: placement.left } : undefined}
        className={cx('may-action-sheet', className)}
      >
        <div className="may-action-sheet__group" data-slot="scroll-area">
          {(title || description) && (
            <div className="may-action-sheet__header">
              {title && (
                <span className="may-action-sheet__title" id={`${id}-title`}>
                  {title}
                </span>
              )}
              {description && (
                <span className="may-action-sheet__description" id={`${id}-description`}>
                  {description}
                </span>
              )}
            </div>
          )}
          {list.map((action, index) => (
            <ActionRow
              key={`${action.label}-${index}`}
              action={action}
              menu={menu}
              onClose={close}
            />
          ))}
        </div>

        {/*
         * Cancel is its own group, separated by real space. Phones only: a
         * menu is cancelled by Escape or by clicking away from it, and adding
         * a Cancel item to one is the tell that a mobile shape was ported
         * rather than adapted.
         */}
        {!menu && (
          <div className="may-action-sheet__group may-action-sheet__group--cancel">
            <CancelRow label={cancelLabel} onClose={close} />
          </div>
        )}
      </div>
    </div>
      )}
    </>
  )
}

interface ActionRowProps {
  action: ActionSheetAction
  menu: boolean
  onClose: () => void
}

/**
 * Rows highlight rather than squish. The press-scale that `may-pressable` gives
 * a button reads wrong on something that spans the full width of a card — the
 * row would visibly shrink away from the edges it is flush with — so these use
 * the grouped-list technique instead: a held highlight, exactly as `ListRow`.
 */
function ActionRow({ action, menu, onClose }: ActionRowProps) {
  const { pressProps } = usePressFeedback(action.disabled)

  return (
    <button
      {...pressProps}
      type="button"
      role={menu ? 'menuitem' : undefined}
      disabled={action.disabled}
      data-slot="action-sheet-action"
      data-destructive={action.destructive ? 'true' : undefined}
      className="may-action-sheet__action may-hoverable"
      onClick={() => {
        // The action runs first: it is the thing the user asked for, and it
        // must not depend on what the consumer's onClose happens to do.
        action.onSelect()
        onClose()
      }}
    >
      <span className="may-action-sheet__label">{action.label}</span>
      {action.icon && (
        <span className="may-action-sheet__icon" aria-hidden>
          {action.icon}
        </span>
      )}
    </button>
  )
}

function CancelRow({ label, onClose }: { label: string; onClose: () => void }) {
  const { pressProps } = usePressFeedback()

  return (
    <button
      {...pressProps}
      type="button"
      data-slot="action-sheet-action"
      className="may-action-sheet__action may-action-sheet__action--cancel may-hoverable"
      onClick={onClose}
    >
      <span className="may-action-sheet__label">{label}</span>
    </button>
  )
}
