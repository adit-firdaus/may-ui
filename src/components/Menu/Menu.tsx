import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { Popover } from '../Popover'
import type { PopoverPlacement } from '../Popover'
import './Menu.css'

/** How long a type-ahead buffer survives between keystrokes, in ms. */
const TYPEAHEAD_RESET = 700

export interface MenuItem {
  label: string
  onSelect?: () => void
  /** Leading glyph. A bare `<svg>` is scaled to the row by CSS. */
  icon?: ReactNode
  /** Draws the row in the destructive tone. Delete, Report, Block. */
  destructive?: boolean
  disabled?: boolean
  /**
   * Starts a new group: draws a hairline *above* this item.
   *
   * A flag on the item that follows the break, rather than a standalone divider
   * entry, because a divider entry has no label and no action — it would sit in
   * the same array as real items and every loop over that array (roving focus,
   * type-ahead, the index the arrow keys count in) would have to remember to
   * skip it.
   */
  separator?: boolean
  /** Keyboard equivalent, drawn muted on the trailing edge — `⌘⌫`. */
  shortcut?: string
}

export interface MenuProps {
  /** The control that opens the menu. Cloned to carry the open state. */
  trigger: ReactNode
  items: MenuItem[]
  /** @default 'bottom-start' */
  placement?: PopoverPlacement
  /** Gap between trigger and menu, in px. @default 6 */
  offset?: number
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial state. @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  'aria-label'?: string
}

/**
 * A list of actions in a Popover — the desktop counterpart to ActionSheet.
 *
 * Everything the keyboard expects of a native menu is here: arrows rove the
 * items and wrap, Home and End jump the ends, Escape closes and hands focus
 * back, and typing jumps to a label — with a repeated letter cycling through
 * the items that start with it rather than searching for "ss". The pointer
 * moves the same highlight the arrows do, which is what makes reaching for a
 * far item with the mouse and finishing the trip with the keyboard work.
 */
export function Menu({
  trigger,
  items = [],
  placement = 'bottom-start',
  offset = 6,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  'aria-label': ariaLabel,
}: MenuProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const [active, setActive] = useState(-1)

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  /** Read inside effects that must not re-run when the caller passes a fresh array. */
  const itemsRef = useRef(items)
  itemsRef.current = items
  const query = useRef('')
  const lastKeyAt = useRef(0)

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  /*
   * Opening starts on the first item the user can actually reach.
   *
   * Deliberately keyed on `open` alone: depending on `items` would reset the
   * highlight to the top every time the caller re-rendered with a fresh array,
   * yanking focus back mid-navigation.
   */
  useEffect(() => {
    if (!open) return
    setActive(itemsRef.current.findIndex((item) => !item.disabled))
  }, [open])

  useEffect(() => {
    if (!open || active < 0) return
    // preventScroll: the menu is inside the viewport by construction, and
    // letting the browser scroll to the item would drag the page under it.
    itemRefs.current[active]?.focus({ preventScroll: true })
  }, [open, active])

  /** Next enabled item in `direction`, wrapping past the ends as a native menu does. */
  const move = (direction: 1 | -1) => {
    const count = items.length
    if (count === 0) return
    // Before anything is highlighted, Down starts at the top and Up at the bottom.
    const from = active >= 0 ? active : direction === 1 ? -1 : 0
    for (let step = 1; step <= count; step++) {
      const index = (((from + direction * step) % count) + count) % count
      if (!items[index]?.disabled) {
        setActive(index)
        return
      }
    }
  }

  const edge = (direction: 1 | -1) => {
    const index = direction === 1 ? items.findIndex((i) => !i.disabled) : findLastEnabled(items)
    if (index >= 0) setActive(index)
  }

  const select = (index: number) => {
    const item = items[index]
    if (!item || item.disabled) return
    item.onSelect?.()
    // Focus goes back to the trigger on its own: the Popover restores it
    // whenever it closes while still holding focus.
    setOpen(false)
  }

  /** Whether a type-ahead buffer is still live, rather than a stale one from before. */
  const searching = () =>
    query.current !== '' && Date.now() - lastKeyAt.current <= TYPEAHEAD_RESET

  /**
   * Type-ahead, as a native menu does it.
   *
   * A buffer of one repeated letter cycles through every item beginning with
   * it; a genuine prefix keeps refining the match it already found, so typing
   * "de" does not jump away from "Delete" on the second keystroke.
   */
  const typeahead = (char: string) => {
    const now = Date.now()
    query.current = searching() ? query.current + char : char
    lastKeyAt.current = now

    const repeated = /^(.)\1*$/.test(query.current)
    const term = repeated ? query.current[0]! : query.current
    // A refining prefix re-examines the current item; anything else starts at
    // the next one, so pressing the same letter twice moves on.
    const refining = !repeated && query.current.length > 1
    const from = (active < 0 ? -1 : active) + (refining ? 0 : 1)

    for (let step = 0; step < items.length; step++) {
      const index = (from + step + items.length) % items.length
      const item = items[index]!
      if (item.disabled) continue
      if (item.label.toLowerCase().startsWith(term)) {
        setActive(index)
        return
      }
    }
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        return
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        return
      case 'Home':
        event.preventDefault()
        edge(1)
        return
      case 'End':
        event.preventDefault()
        edge(-1)
        return
      default:
        break
    }

    // One printable character, no modifier: anything else is a shortcut the
    // page or the browser owns. Space is the exception — it activates the
    // highlighted item, and only counts as a character once a search is already
    // in flight, where it is the word break in "Mark as Unread".
    if (event.key === ' ' && !searching()) return
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      typeahead(event.key.toLowerCase())
    }
  }

  /*
   * The one item in the tab order. Before the highlight has landed — the first
   * render, or a server render of an initially-open menu — it is the first
   * enabled item, so Tab can still reach the menu at all.
   */
  const tabbable = active >= 0 ? active : items.findIndex((item) => !item.disabled)

  return (
    <Popover
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      offset={offset}
      /* No arrow and no padding: a menu's rows run to its edges, and a pointer
       * arrow on a list of actions is a tooltip's gesture, not a menu's. */
      arrow={false}
      padded={false}
      /* The menu below owns the role, so its items are its own direct children
       * rather than something an intervening dialog claims to contain. */
      role="none"
      haspopup="menu"
      className={className}
    >
      <div
        role="menu"
        aria-label={ariaLabel}
        data-slot="menu"
        className="may-menu"
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => (
          <MenuItemRow
            key={`${item.label}-${index}`}
            item={item}
            tabbable={index === tabbable}
            register={(node) => {
              itemRefs.current[index] = node
            }}
            onActivate={() => select(index)}
            onHover={() => {
              // The pointer drives the same highlight the arrows do, so a
              // half-mouse, half-keyboard trip through the menu never has two
              // different ideas of where the user is.
              if (!item.disabled) setActive(index)
            }}
          />
        ))}
      </div>
    </Popover>
  )
}

function findLastEnabled(items: MenuItem[]): number {
  for (let i = items.length - 1; i >= 0; i--) if (!items[i]?.disabled) return i
  return -1
}

interface MenuItemRowProps {
  item: MenuItem
  /** The single item in the tab order. */
  tabbable: boolean
  register: (node: HTMLButtonElement | null) => void
  onActivate: () => void
  onHover: () => void
}

/**
 * One row.
 *
 * Hoverable and press-responsive but *not* `may-pressable`: a row that scales
 * inside a fixed panel drags its neighbours' hairlines with it. The canonical
 * `ListRow` makes the same trade — for row-shaped things the press reads as a
 * fill, and the bounce belongs to controls that stand on their own.
 */
function MenuItemRow({ item, tabbable, register, onActivate, onHover }: MenuItemRowProps) {
  const { pressProps } = usePressFeedback(item.disabled)

  return (
    <button
      {...pressProps}
      ref={register}
      type="button"
      role="menuitem"
      data-slot="menu-item"
      data-destructive={item.destructive ? 'true' : undefined}
      data-separator={item.separator ? 'true' : undefined}
      // Roving focus: exactly one item is in the tab order, so Tab leaves the
      // menu rather than walking it.
      tabIndex={tabbable ? 0 : -1}
      disabled={item.disabled}
      onClick={onActivate}
      onPointerEnter={onHover}
      className={cx('may-menu__item', 'may-hoverable')}
    >
      {item.icon && (
        <span className="may-menu__icon" aria-hidden>
          {item.icon}
        </span>
      )}
      <span className="may-menu__label">{item.label}</span>
      {item.shortcut && (
        <span className="may-menu__shortcut" aria-hidden>
          {item.shortcut}
        </span>
      )}
    </button>
  )
}
