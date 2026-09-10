import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IoCheckmark, IoChevronForward } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { Kbd } from '../../components/Kbd/Kbd'
/* Kbd arrives as a module, so its stylesheet comes with it. */
import './ContextMenu.css'

export interface ContextMenuAction {
  type?: 'item'
  id: string
  label: ReactNode
  /** Leading glyph. A checked item shows its checkmark in this slot instead. */
  icon?: ReactNode
  /** Kbd tokens, e.g. `['cmd', 'c']`. */
  shortcut?: string[]
  disabled?: boolean
  /** Tints the row red — Delete, Remove, Move to Trash. */
  destructive?: boolean
  /** Draws a leading checkmark and reports the item as a checkbox. */
  checked?: boolean
  /** A nested menu. Present or absent, never empty — an empty submenu is a dead end. */
  items?: ContextMenuEntry[]
  onSelect?: () => void
}

export interface ContextMenuSeparator {
  type: 'separator'
  id?: string
}

export interface ContextMenuLabel {
  type: 'label'
  id?: string
  label: ReactNode
}

export type ContextMenuEntry = ContextMenuAction | ContextMenuSeparator | ContextMenuLabel

export interface ContextMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: ContextMenuEntry[]
  children: ReactNode
  /** Fired before the item's own `onSelect`. */
  onSelect?: (item: ContextMenuAction) => void
  onOpenChange?: (open: boolean) => void
  /** Let the browser's own menu through instead. */
  disabled?: boolean
  /** Row height rung. @default 'md' */
  size?: 'sm' | 'md'
  /** Accessible name for the menu. @default 'Context menu' */
  label?: string
}

/** Breathing room kept between a panel and the edge of the window, in px. */
const VIEWPORT_MARGIN = 8

/** How far a submenu tucks back under its parent, so the two read as connected. */
const SUBMENU_OVERLAP = 6

/** The panel's own block padding, so a submenu's first row lines up with its parent. */
const PANEL_INSET = 4

/**
 * A submenu waits before opening, so that dragging the pointer diagonally
 * across a sibling on the way to an already-open one does not swap it out from
 * under you. This is the cheap half of the "safe triangle" trick, and in
 * practice it is the half that matters.
 */
const SUBMENU_OPEN_DELAY = 110

/** And waits again before closing, so crossing the gap into it is forgiving. */
const SUBMENU_CLOSE_DELAY = 260

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const isAction = (entry: ContextMenuEntry): entry is ContextMenuAction =>
  entry.type !== 'separator' && entry.type !== 'label'

/** A mutable box holding the item a submenu hangs off. */
type AnchorRef = { current: HTMLButtonElement | null }

/** Where a panel would like to sit, before the viewport gets a say. */
type Placement =
  | { kind: 'point'; x: number; y: number }
  | { kind: 'submenu'; anchorRef: AnchorRef }

interface Resolved {
  x: number
  y: number
  /** The corner the panel grew from — the spring scales out of it. */
  origin: string
}

/**
 * Fit the panel inside the window.
 *
 * A menu opened near the right edge FLIPS to the other side of the pointer
 * rather than being nudged left: a nudged menu ends up underneath the cursor,
 * and the first thing a cursor does after a right-click is move. Only once
 * flipping has also failed does it clamp.
 *
 * The corner it ends up growing from comes back with it, so the scale-in always
 * expands away from the pointer instead of sliding across it.
 */
function resolve(panel: HTMLElement, placement: Placement): Resolved {
  const { width, height } = panel.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  let x: number
  let y: number
  let flipX = false
  let flipY = false

  if (placement.kind === 'point') {
    x = placement.x
    y = placement.y
    if (x + width > vw - VIEWPORT_MARGIN) {
      x = placement.x - width
      flipX = true
    }
    if (y + height > vh - VIEWPORT_MARGIN) {
      y = placement.y - height
      flipY = true
    }
  } else {
    const item = placement.anchorRef.current
    const anchor = item?.getBoundingClientRect()
    // The submenu hangs off the PARENT PANEL's edge, not the item's: an item is
    // only as wide as the panel minus its padding, and a submenu that started
    // at the label would leave a visible step.
    const parent = item?.closest('[data-slot="menu"]')?.getBoundingClientRect()
    x = (parent?.right ?? 0) - SUBMENU_OVERLAP
    y = (anchor?.top ?? 0) - PANEL_INSET
    if (x + width > vw - VIEWPORT_MARGIN) {
      x = (parent?.left ?? 0) - width + SUBMENU_OVERLAP
      flipX = true
    }
    if (y + height > vh - VIEWPORT_MARGIN) {
      y = vh - VIEWPORT_MARGIN - height
      flipY = true
    }
  }

  return {
    x: Math.max(VIEWPORT_MARGIN, Math.min(x, vw - VIEWPORT_MARGIN - width)),
    y: Math.max(VIEWPORT_MARGIN, Math.min(y, vh - VIEWPORT_MARGIN - height)),
    origin: `${flipX ? 'right' : 'left'} ${flipY ? 'bottom' : 'top'}`,
  }
}

/* -------------------------------------------------------------------------- *
 * Item
 * -------------------------------------------------------------------------- */

interface MenuItemProps {
  item: ContextMenuAction
  active: boolean
  submenuOpen: boolean
  /** True when the submenu was opened from the keyboard and should take focus. */
  submenuAutoFocus: boolean
  size: 'sm' | 'md'
  /** Depth of the panel this item lives in; its submenu sits one deeper. */
  level: number
  /** Hands the button up to the panel, which owns roving focus. */
  register: (node: HTMLButtonElement | null) => void
  onOpenSubmenu: () => void
  onHover: () => void
  onHoverEnd: () => void
  onSelectAction: (item: ContextMenuAction) => void
  onCloseAll: () => void
  onCloseSubmenu: () => void
}

function MenuItem({
  item,
  active,
  submenuOpen,
  submenuAutoFocus,
  size,
  level,
  register,
  onOpenSubmenu,
  onHover,
  onHoverEnd,
  onSelectAction,
  onCloseAll,
  onCloseSubmenu,
}: MenuItemProps) {
  const { pressProps } = usePressFeedback(item.disabled)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const hasSubmenu = Boolean(item.items?.length)

  return (
    /*
     * role="none" because a menu's children have to be menuitems, separators or
     * groups, and an unlabelled wrapper between them breaks the pattern. The
     * wrapper exists so the pointer can travel from an item into its own
     * submenu without ever leaving one element's subtree — which is what makes
     * the close delay below reliable rather than approximate.
     */
    <div role="none" className="may-menu__slot" onMouseEnter={onHover} onMouseLeave={onHoverEnd}>
      <button
        {...pressProps}
        ref={(node) => {
          buttonRef.current = node
          register(node)
        }}
        type="button"
        role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
        aria-checked={item.checked}
        aria-haspopup={hasSubmenu ? 'menu' : undefined}
        aria-expanded={hasSubmenu ? submenuOpen : undefined}
        aria-disabled={item.disabled || undefined}
        // Roving focus: exactly one item in an open menu is ever a tab stop,
        // and it is the one the arrow keys last landed on.
        tabIndex={active ? 0 : -1}
        data-active={active ? 'true' : undefined}
        data-destructive={item.destructive ? 'true' : undefined}
        onClick={() => {
          if (item.disabled) return
          if (hasSubmenu) {
            onOpenSubmenu()
            return
          }
          onSelectAction(item)
          onCloseAll()
        }}
        /*
         * No `may-hoverable`: the pointer entering a row MAKES it active, so
         * the shared hover fill would paint a second, weaker highlight over the
         * real one. No `may-pressable` either — a full-width row flashes rather
         * than scales, exactly as ListRow does it.
         */
        className="may-menu__item"
      >
        <span className="may-menu__lead" aria-hidden>
          {item.checked ? (
            <IoCheckmark className="may-menu__check" focusable="false" />
          ) : (
            item.icon
          )}
        </span>
        <span className="may-menu__label">{item.label}</span>
        {item.shortcut && item.shortcut.length > 0 && (
          <span className="may-menu__shortcut">
            {item.shortcut.map((token) => (
              <Kbd key={token} size="xs">
                {token}
              </Kbd>
            ))}
          </span>
        )}
        {hasSubmenu && (
          <IoChevronForward className="may-menu__chevron" aria-hidden focusable="false" />
        )}
      </button>

      {hasSubmenu && submenuOpen && (
        <MenuPanel
          entries={item.items!}
          placement={{ kind: 'submenu', anchorRef: buttonRef }}
          size={size}
          level={level + 1}
          autoFocus={submenuAutoFocus}
          label={typeof item.label === 'string' ? item.label : undefined}
          onSelectAction={onSelectAction}
          onCloseAll={onCloseAll}
          onCloseLevel={onCloseSubmenu}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Panel
 * -------------------------------------------------------------------------- */

interface MenuPanelProps {
  entries: ContextMenuEntry[]
  placement: Placement
  size: 'sm' | 'md'
  /** 0 for the root menu; every submenu is 1 or deeper. */
  level: number
  autoFocus: boolean
  label?: string
  panelRef?: RefObject<HTMLDivElement>
  onSelectAction: (item: ContextMenuAction) => void
  /** Tear the whole menu down — an item was chosen, or Tab left it. */
  onCloseAll: () => void
  /** Close just this level and hand focus back to whatever opened it. */
  onCloseLevel: () => void
}

/**
 * One panel of the menu, and every panel below it.
 *
 * Submenus render inside their own item rather than beside the panel, so the
 * whole open menu — however deep — is one DOM subtree. That is what lets a
 * single `contains()` check answer "did that click land outside the menu", and
 * what lets the pointer cross from an item into its submenu without a
 * `mouseleave` firing in between.
 */
function MenuPanel({
  entries,
  placement,
  size,
  level,
  autoFocus,
  label,
  panelRef,
  onSelectAction,
  onCloseAll,
  onCloseLevel,
}: MenuPanelProps) {
  const ownRef = useRef<HTMLDivElement>(null)
  const ref = panelRef ?? ownRef
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [resolved, setResolved] = useState<Resolved | null>(null)
  const [active, setActive] = useState(-1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [openByKeyboard, setOpenByKeyboard] = useState(false)

  /** Indices of the entries a keyboard can land on. */
  const stops = entries.reduce<number[]>((acc, entry, index) => {
    if (isAction(entry) && !entry.disabled) acc.push(index)
    return acc
  }, [])

  /*
   * Measure, then place. The panel lays out at its natural size behind
   * `visibility: hidden` on the first pass — its own size is what decides
   * whether it has to flip, so there is no honest way to position it before it
   * exists. Both the reveal and the spring hang off `data-placed`, so nothing
   * is ever visible in the wrong corner for a frame.
   *
   * Runs once: `placement` is a fresh object on every render, and re-placing
   * mid-animation would fight the spring.
   */
  useIsomorphicLayoutEffect(() => {
    const panel = ref.current
    if (panel) setResolved(resolve(panel, placement))
  }, [])

  /*
   * The root panel takes focus itself rather than an item — macOS opens a
   * context menu with nothing selected, and the first arrow press is what
   * chooses. A submenu opened from the keyboard is the opposite case: arriving
   * there was already a choice, so its first item is armed.
   */
  useIsomorphicLayoutEffect(() => {
    if (autoFocus && stops[0] !== undefined) setActive(stops[0])
    else ref.current?.focus()
  }, [])

  useEffect(() => {
    if (active >= 0) itemRefs.current[active]?.focus()
  }, [active])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  /** Open `index`'s submenu — or close whatever is open — after a beat. */
  const schedule = (index: number | null) => {
    if (timer.current) clearTimeout(timer.current)
    if (index === openIndex) return
    timer.current = setTimeout(
      () => {
        setOpenByKeyboard(false)
        setOpenIndex(index)
      },
      index === null ? SUBMENU_CLOSE_DELAY : SUBMENU_OPEN_DELAY,
    )
  }

  const move = (delta: number) => {
    if (stops.length === 0) return
    const at = stops.indexOf(active)
    const next =
      at === -1 ? (delta > 0 ? 0 : stops.length - 1) : (at + delta + stops.length) % stops.length
    setActive(stops[next]!)
  }

  const openSubmenu = (index: number) => {
    if (timer.current) clearTimeout(timer.current)
    setActive(index)
    setOpenByKeyboard(true)
    setOpenIndex(index)
  }

  const closeSubmenu = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpenByKeyboard(false)
    setOpenIndex(null)
    if (active >= 0) itemRefs.current[active]?.focus()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const entry = active >= 0 ? entries[active] : undefined
    const action = entry && isAction(entry) ? entry : undefined
    const hasSubmenu = Boolean(action?.items?.length)

    switch (event.key) {
      case 'ArrowDown':
        move(1)
        break
      case 'ArrowUp':
        move(-1)
        break
      case 'Home':
        if (stops[0] !== undefined) setActive(stops[0])
        break
      case 'End':
        if (stops.length) setActive(stops[stops.length - 1]!)
        break
      case 'ArrowRight':
        if (!hasSubmenu) return
        openSubmenu(active)
        break
      case 'ArrowLeft':
        // The root menu has nowhere to go leftward; let the key through so a
        // caret in whatever is underneath still moves.
        if (level === 0) return
        onCloseLevel()
        break
      case 'Enter':
      case ' ':
        if (!action) return
        if (hasSubmenu) openSubmenu(active)
        else {
          onSelectAction(action)
          onCloseAll()
        }
        break
      case 'Escape':
        // One level at a time, the way a nested menu unwinds on macOS.
        if (openIndex !== null) closeSubmenu()
        else onCloseLevel()
        break
      case 'Tab':
        onCloseAll()
        break
      default:
        return
    }

    event.preventDefault()
    // Submenus are DOM descendants of their parent panel, so without this every
    // key would be handled once per level on its way back up the tree.
    event.stopPropagation()
  }

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      tabIndex={-1}
      data-slot="menu"
      data-size={size}
      data-level={level}
      data-placed={resolved ? 'true' : undefined}
      onKeyDown={onKeyDown}
      className="may-menu"
      style={{
        insetInlineStart: resolved?.x ?? 0,
        insetBlockStart: resolved?.y ?? 0,
        transformOrigin: resolved?.origin ?? 'left top',
      }}
    >
      {entries.map((entry, index) => {
        if (entry.type === 'separator') {
          return (
            <div
              key={entry.id ?? `separator-${index}`}
              role="separator"
              className="may-menu__separator"
            />
          )
        }

        if (entry.type === 'label') {
          return (
            <div
              key={entry.id ?? `label-${index}`}
              role="presentation"
              className="may-menu__section"
            >
              {entry.label}
            </div>
          )
        }

        return (
          <MenuItem
            key={entry.id}
            item={entry}
            active={index === active}
            submenuOpen={openIndex === index}
            submenuAutoFocus={openIndex === index && openByKeyboard}
            size={size}
            level={level}
            register={(node) => {
              itemRefs.current[index] = node
            }}
            onOpenSubmenu={() => openSubmenu(index)}
            onHover={() => {
              if (!entry.disabled) setActive(index)
              // Hovering a row with no submenu closes whichever one is open —
              // after the same beat, so a diagonal reach survives it.
              schedule(entry.items?.length ? index : null)
            }}
            onHoverEnd={() => schedule(null)}
            onSelectAction={onSelectAction}
            onCloseAll={onCloseAll}
            onCloseSubmenu={closeSubmenu}
          />
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * ContextMenu
 * -------------------------------------------------------------------------- */

/**
 * A right-click menu.
 *
 * Three things separate this from a dropdown wearing a different name. It opens
 * at the POINTER, not at a trigger, so its position is whatever the viewport
 * will allow and it flips rather than slides when it will not fit. Its submenus
 * open on hover with a delay in each direction, which is what makes a diagonal
 * reach across a sibling row survivable. And it stays one DOM subtree however
 * deep it nests, which turns dismissal into a single containment check instead
 * of a set of them.
 *
 * The wrapper is `display: contents`, so wiring a context menu onto a table row
 * or a grid cell never inserts a box into that layout.
 */
export function ContextMenu({
  items,
  children,
  onSelect,
  onOpenChange,
  disabled = false,
  size = 'md',
  label = 'Context menu',
  className,
  onContextMenu,
  ...rest
}: ContextMenuProps) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const close = () => {
    setAnchor(null)
    onOpenChange?.(false)
    restoreTo.current?.focus?.()
  }

  const open = (event: ReactMouseEvent<HTMLDivElement>) => {
    onContextMenu?.(event)
    // A consumer that called preventDefault has said it handled the gesture.
    if (disabled || event.defaultPrevented) return
    event.preventDefault()
    restoreTo.current = document.activeElement as HTMLElement | null
    setAnchor({ x: event.clientX, y: event.clientY })
    onOpenChange?.(true)
  }

  useEffect(() => {
    if (!anchor) return

    const inside = (target: EventTarget | null) => Boolean(menuRef.current?.contains(target as Node))

    // pointerdown, not click: the menu has to be gone before whatever sits
    // underneath it starts reacting to the press.
    const onPointerDown = (event: PointerEvent) => {
      if (!inside(event.target)) {
        setAnchor(null)
        onOpenChange?.(false)
      }
    }
    /*
     * A fallback for the case where the panel never took focus, so its own
     * handler never sees the key. The panel stops propagation for the keys it
     * handles, which is what keeps a nested menu unwinding one level at a time
     * rather than vanishing whole.
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    /*
     * A fixed panel does not follow the element it was opened over, so once
     * that element moves the menu is pointing at nothing. Capture, because the
     * scroll may happen in any ancestor rather than on the window — and skip
     * the menu's own scrollport, which is a long menu doing its job.
     */
    const onScroll = (event: Event) => {
      if (!inside(event.target)) close()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [anchor, onOpenChange])

  const selectAction = (item: ContextMenuAction) => {
    onSelect?.(item)
    item.onSelect?.()
  }

  return (
    <div
      {...rest}
      data-slot="context-menu"
      data-size={size}
      className={cx('may-context', className)}
      onContextMenu={open}
    >
      {children}
      {anchor && (
        <MenuPanel
          // Re-opening somewhere else is a new menu, not a moved one: the key
          // remounts it so it measures, flips and springs from the new corner.
          key={`${anchor.x},${anchor.y}`}
          entries={items}
          placement={{ kind: 'point', x: anchor.x, y: anchor.y }}
          size={size}
          level={0}
          autoFocus={false}
          label={label}
          panelRef={menuRef}
          onSelectAction={selectAction}
          onCloseAll={close}
          onCloseLevel={close}
        />
      )}
    </div>
  )
}
