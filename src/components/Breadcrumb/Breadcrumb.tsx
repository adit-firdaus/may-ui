import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { FlipSnapshot } from '../../motion/flip'
import { play, snapshot } from '../../motion/flip'
import type { MaySize } from '../../types'
import './Breadcrumb.css'

/** xs is absent: a crumb that small stops being a touch target. */
export type BreadcrumbSize = Exclude<MaySize, 'xs'>

export interface BreadcrumbItem {
  label: ReactNode
  /** Renders the crumb as a real `<a>`. */
  href?: string
  /** Renders the crumb as a real `<button>`. Ignored when `href` is set. */
  onClick?: () => void
  /** Leading glyph — a folder, a disk, an app icon. */
  icon?: ReactNode
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  items: BreadcrumbItem[]
  /**
   * Fold the middle of the trail into an ellipsis once it is longer than this.
   * Unset means never collapse.
   */
  maxItems?: number
  /** How many leading crumbs survive a collapse. @default 1 */
  itemsBeforeCollapse?: number
  /** How many trailing crumbs survive a collapse. @default 2 */
  itemsAfterCollapse?: number
  /** Replaces the chevron between crumbs. */
  separator?: ReactNode
  /** @default 'md' */
  size?: BreadcrumbSize
  /** Accessible name for the trail. @default 'Breadcrumb' */
  'aria-label'?: string
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** `index` is the crumb's position in the original trail, or -1 for the ellipsis. */
interface Entry {
  item: BreadcrumbItem | null
  index: number
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d="M6 3.5L10.5 8L6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * One crumb. A link is an `<a>`, an action is a `<button>`, and the crumb you
 * are already on is neither — it is text, marked `aria-current="page"`. None
 * of the three is a `<div onClick>`, which keyboard and switch-access users
 * cannot reach at all.
 */
function Crumb({ item, current }: { item: BreadcrumbItem; current: boolean }) {
  const interactive = !current && (item.href != null || item.onClick != null)
  const { pressProps } = usePressFeedback(!interactive)

  const content = (
    <>
      {item.icon && (
        <span className="may-breadcrumb__icon" aria-hidden>
          {item.icon}
        </span>
      )}
      <span className="may-breadcrumb__label">{item.label}</span>
    </>
  )

  if (!interactive) {
    return (
      <span className="may-breadcrumb__crumb" aria-current={current ? 'page' : undefined}>
        {content}
      </span>
    )
  }

  if (item.href != null) {
    return (
      <a
        {...pressProps}
        href={item.href}
        onClick={item.onClick}
        className="may-breadcrumb__crumb may-pressable may-hoverable"
      >
        {content}
      </a>
    )
  }

  return (
    <button
      {...pressProps}
      type="button"
      onClick={item.onClick}
      className="may-breadcrumb__crumb may-pressable may-hoverable"
    >
      {content}
    </button>
  )
}

function EllipsisCrumb({ hidden, onExpand }: { hidden: number; onExpand: () => void }) {
  const { pressProps } = usePressFeedback()

  return (
    <button
      {...pressProps}
      type="button"
      onClick={onExpand}
      aria-label={`Show ${hidden} hidden ${hidden === 1 ? 'level' : 'levels'}`}
      className="may-breadcrumb__crumb may-breadcrumb__ellipsis may-pressable may-hoverable"
    >
      <span aria-hidden>&#8230;</span>
    </button>
  )
}

/**
 * A path through a hierarchy — the Files trail, a Settings drill-down.
 *
 * Past `maxItems` the middle folds into an ellipsis that expands in place, and
 * the expansion is a FLIP: the crumbs that survive keep their DOM nodes, are
 * measured before and after, and slide from where they were rather than the
 * whole trail snapping to a new width.
 */
export function Breadcrumb({
  items,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 2,
  separator,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...rest
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const first = useRef<FlipSnapshot | null>(null)

  // Collapsing has to actually remove more crumbs than the ellipsis adds back,
  // or the trail gets longer when it folds.
  const collapsed =
    !expanded &&
    maxItems != null &&
    items.length > Math.max(maxItems, itemsBeforeCollapse + itemsAfterCollapse + 1)

  const tailStart = items.length - itemsAfterCollapse
  const entries: Entry[] = collapsed
    ? [
        ...items.slice(0, itemsBeforeCollapse).map((item, i) => ({ item, index: i })),
        { item: null, index: -1 },
        ...items.slice(tailStart).map((item, i) => ({ item, index: tailStart + i })),
      ]
    : items.map((item, i) => ({ item, index: i }))

  const expand = () => {
    // FIRST — taken before the state change, while the trail is still folded.
    if (!reducedMotion && listRef.current) first.current = snapshot(listRef.current.children)
    setExpanded(true)
  }

  useIsomorphicLayoutEffect(() => {
    const before = first.current
    if (!before || !listRef.current) return
    first.current = null
    // LAST + INVERT + PLAY. Keys are the crumb's index in the ORIGINAL trail,
    // so React reuses the surviving nodes and the snapshot still recognises
    // them; the newly revealed ones have no `before` and fade in instead.
    play(listRef.current.children, before, { easing: 'var(--may-spring-smooth)' })
  }, [expanded])

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      data-slot="breadcrumb"
      data-size={size}
      className={cx('may-breadcrumb', className)}
    >
      <ol ref={listRef} className="may-breadcrumb__list">
        {entries.map((entry, position) => {
          const last = position === entries.length - 1
          return (
            <li
              key={entry.item ? `crumb-${entry.index}` : 'ellipsis'}
              className="may-breadcrumb__item"
            >
              {entry.item ? (
                <Crumb item={entry.item} current={last} />
              ) : (
                <EllipsisCrumb
                  hidden={items.length - itemsBeforeCollapse - itemsAfterCollapse}
                  onExpand={expand}
                />
              )}
              {!last && (
                <span className="may-breadcrumb__separator" aria-hidden>
                  {separator ?? <Chevron />}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
