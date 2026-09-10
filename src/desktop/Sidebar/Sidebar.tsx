import type { ButtonHTMLAttributes, HTMLAttributes, PointerEvent, ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useAutoId } from '../../utils/useId'
import './Sidebar.css'

/* ------------------------------------------------------------------ *
 * Context
 *
 * Items need two things from the sidebar: whether it is railed, and a way
 * to raise the flyout label. Both travel through context so a consumer can
 * nest items inside their own wrappers without threading props.
 * ------------------------------------------------------------------ */

interface TooltipState {
  label: ReactNode
  /** Viewport coordinates — the flyout is position: fixed, see `showTooltip`. */
  top: number
  left: number
  /** Bumped per raise so the entry animation replays when moving item to item. */
  seq: number
}

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
  showTooltip: (label: ReactNode, anchor: HTMLElement) => void
  hideTooltip: () => void
}

const noop = () => {}

/** Defaults let SidebarItem render standalone (in a Storybook row, say). */
const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: noop,
  showTooltip: noop,
  hideTooltip: noop,
})

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  children?: ReactNode
  /** Controlled rail state. Leave undefined to let the sidebar own it. */
  collapsed?: boolean
  /** @default false */
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Pinned above the scrolling body — an app title, a search field, a toggle. */
  header?: ReactNode
  /** Pinned below it — the account row, storage, a sign-out action. */
  footer?: ReactNode
}

/**
 * An app sidebar that collapses to an icon rail.
 *
 * Width is the only thing that actually animates: labels fading, badges
 * shrinking to dots and section titles folding away are all driven off
 * `data-collapsed` on this root, so the whole collapse reads as one gesture
 * on one curve rather than a dozen coincidental animations.
 *
 * Collapsed labels are still in the DOM at `opacity: 0`, so a screen reader
 * announces the rail exactly as it announces the expanded sidebar. Sighted
 * mouse users get the label back as a flyout.
 */
export function Sidebar({
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  header,
  footer,
  className,
  ...rest
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed)
  const isCollapsed = collapsed ?? internal
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const seq = useRef(0)

  const toggle = useCallback(() => {
    const next = !(collapsed ?? internal)
    if (collapsed === undefined) setInternal(next)
    onCollapsedChange?.(next)
  }, [collapsed, internal, onCollapsedChange])

  /**
   * The flyout is `position: fixed` and lives at the sidebar's root rather
   * than inside the item: a fixed element escapes the scrolling body's
   * clipping, but only while no ancestor has a transform — and every
   * `may-pressable` item has one.
   */
  const showTooltip = useCallback((label: ReactNode, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    seq.current += 1
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right, seq: seq.current })
  }, [])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  /* Expanding while the pointer rests on an item would strand the flyout. */
  useEffect(() => setTooltip(null), [isCollapsed])

  const context = useMemo<SidebarContextValue>(
    () => ({ collapsed: isCollapsed, toggle, showTooltip, hideTooltip }),
    [isCollapsed, toggle, showTooltip, hideTooltip],
  )

  return (
    <SidebarContext.Provider value={context}>
      <nav
        {...rest}
        data-slot="sidebar"
        data-collapsed={isCollapsed ? 'true' : undefined}
        className={cx('may-sidebar', className)}
      >
        {header && <div className="may-sidebar__header">{header}</div>}
        <div className="may-sidebar__body" data-slot="scroll-area">
          {children}
        </div>
        {footer && <div className="may-sidebar__footer">{footer}</div>}
        {isCollapsed && tooltip && (
          <span
            key={tooltip.seq}
            className="may-sidebar__tooltip"
            style={{ top: tooltip.top, left: tooltip.left }}
            aria-hidden
          >
            {tooltip.label}
          </span>
        )}
      </nav>
    </SidebarContext.Provider>
  )
}

/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode
  /** Uppercase eyebrow above the items. */
  title?: ReactNode
  /** Turns the title into a disclosure that folds its items away. */
  collapsible?: boolean
  /** Controlled disclosure state. */
  open?: boolean
  /** @default true */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * A titled group of items.
 *
 * The panel animates its height with `grid-template-rows: 0fr → 1fr`, the same
 * technique `Collapsible` uses — a measured max-height would either clip a long
 * group or spend the tail of the transition animating empty space.
 *
 * A railed sidebar has nowhere to put a title, so a collapsed group would leave
 * its items unreachable with no way to get them back. Sections therefore force
 * themselves open on the rail and restore their own state when it reopens.
 */
export function SidebarSection({
  children,
  title,
  collapsible = false,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  id,
  ...rest
}: SidebarSectionProps) {
  const { collapsed: railed } = useContext(SidebarContext)
  const [internal, setInternal] = useState(defaultOpen)
  const autoId = useAutoId(id)
  const panelId = `${autoId}-panel`
  const { pressProps } = usePressFeedback()

  const isOpen = !collapsible || railed ? true : (open ?? internal)

  const onToggle = () => {
    const next = !isOpen
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  return (
    <div
      {...rest}
      id={autoId}
      data-slot="sidebar-section"
      data-state={isOpen ? 'open' : 'closed'}
      className={cx('may-sidebar-section', className)}
    >
      {title &&
        (collapsible ? (
          <button
            {...pressProps}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={onToggle}
            className="may-sidebar-section__header may-hoverable"
          >
            <span className="may-sidebar-section__title">{title}</span>
            <svg className="may-sidebar-section__chevron" viewBox="0 0 16 16" aria-hidden focusable="false">
              <path
                d="M6 3.5L10.5 8L6 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="may-sidebar-section__header">
            <span className="may-sidebar-section__title">{title}</span>
          </div>
        ))}

      <div id={panelId} className="may-sidebar-section__panel">
        {/* The clipping child the grid track squeezes; items keep their own
         * height so nothing reflows while the track animates. */}
        <div className="may-sidebar-section__clip">
          <div className="may-sidebar-section__items">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Item
 * ------------------------------------------------------------------ */

export interface SidebarItemProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** The label. Also what the rail's flyout shows. */
  children: ReactNode
  icon?: ReactNode
  /** A count or status pill. On the rail it shrinks to a dot on the icon. */
  badge?: ReactNode
  /** Tinted fill, never an outline. */
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  /** Renders a real `<a>` instead of a `<button>`. */
  href?: string
}

/**
 * One navigation row.
 *
 * Deliberately not `may-pressable`: a full-width row that scales exposes the
 * surface behind its edges and reads as a bug. It still takes the press props,
 * because `data-pressed` is what drives the highlight — the same split
 * `ListRow` and `Collapsible` make.
 */
export function SidebarItem({
  children,
  icon,
  badge,
  active = false,
  disabled = false,
  onClick,
  href,
  className,
  ...rest
}: SidebarItemProps) {
  const { collapsed, showTooltip, hideTooltip } = useContext(SidebarContext)
  const { pressProps } = usePressFeedback(disabled)

  const raise = (target: HTMLElement) => {
    if (collapsed) showTooltip(children, target)
  }

  const shared = {
    ...pressProps,
    'data-slot': 'sidebar-item',
    'data-active': active ? ('true' as const) : undefined,
    'aria-current': active ? ('page' as const) : undefined,
    className: cx('may-sidebar-item', 'may-hoverable', className),
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      // Mouse only. On a touch screen `pointerenter` fires on tap, and the
      // flyout would stay up long after the finger had gone.
      if (event.pointerType === 'mouse') raise(event.currentTarget)
    },
    onPointerLeave: () => {
      pressProps.onPointerLeave()
      hideTooltip()
    },
    onFocus: (event: { currentTarget: HTMLElement }) => {
      // Keyboard focus earns the flyout; a click that focuses the row does not.
      if (event.currentTarget.matches(':focus-visible')) raise(event.currentTarget)
    },
    onBlur: hideTooltip,
  }

  const content = (
    <>
      {icon && (
        <span className="may-sidebar-item__icon" aria-hidden>
          {icon}
        </span>
      )}
      <span className="may-sidebar-item__label">{children}</span>
      {badge != null && <span className="may-sidebar-item__badge">{badge}</span>}
    </>
  )

  if (href) {
    return (
      <a
        {...(rest as HTMLAttributes<HTMLAnchorElement>)}
        {...shared}
        // An anchor has no `disabled`, and dropping the href alone leaves it in
        // the tab order announcing nothing about why it does nothing.
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
      {...shared}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * Toggle
 * ------------------------------------------------------------------ */

export interface SidebarToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Overrides the generated "Collapse sidebar" / "Expand sidebar" label. */
  label?: string
}

/**
 * The rail switch. A small square control, so unlike a row it *does* scale on
 * press — `may-pressable` is the whole point of a control this size.
 */
export function SidebarToggle({ label, className, onClick, ...rest }: SidebarToggleProps) {
  const { collapsed, toggle } = useContext(SidebarContext)
  const { pressProps } = usePressFeedback(rest.disabled)
  const text = label ?? (collapsed ? 'Expand sidebar' : 'Collapse sidebar')

  return (
    <button
      {...rest}
      {...pressProps}
      type="button"
      title={text}
      aria-label={text}
      aria-expanded={!collapsed}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      data-slot="sidebar-toggle"
      className={cx('may-sidebar-toggle', 'may-pressable', 'may-hoverable', className)}
    >
      <svg className="may-sidebar-toggle__icon" viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M9.5 3.5L5 8l4.5 4.5M13.5 3.5L9 8l4.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
