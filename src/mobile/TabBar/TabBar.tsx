import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { duration, resolveCurve, spring } from '../../motion/springs'
import { Badge } from '../../components/Badge'
import type { MayTone } from '../../types'
import './TabBar.css'

export interface TabBarItem {
  /** Identity of the tab — what `onValueChange` reports. */
  value: string
  label: ReactNode
  /** Outline glyph, drawn while the tab is not selected. */
  icon: ReactNode
  /**
   * Filled counterpart, drawn while it is. iOS swaps the glyph's *weight* on
   * selection and only then tints it; a tint alone is the tell that a bar was
   * ported rather than designed.
   */
  activeIcon?: ReactNode
  /** Unread count, hung off the icon's trailing-top corner. */
  badge?: number
  /** A bare dot instead of a count — "something new here", without a number. */
  dot?: boolean
  /** Render the item as a real link. Router-free navigation still gets an `<a>`. */
  href?: string
  disabled?: boolean
}

export interface TabBarProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: TabBarItem[]
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. Falls back to the first item. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Pin the bar to the bottom edge of the viewport. @default true */
  fixed?: boolean
  /** Keep the labels under the glyphs. Off is iOS's compact landscape bar. @default true */
  labels?: boolean
  /** Draw the hairline between the bar and the content above it. @default true */
  separator?: boolean
  /** Tint of the selected item. @default 'tint' */
  tone?: MayTone
}

/** How far the glyph dips before it springs back. */
const POP_FROM = 0.78

/**
 * The bottom tab bar.
 *
 * Two decisions are worth stating outright.
 *
 * It is a `<nav>` of links and buttons marked with `aria-current`, not a
 * `role="tablist"`. `role="tab"` promises an associated `tabpanel` and
 * arrow-key movement inside a single widget; a tab bar swaps whole screens,
 * often with the URL, and the tabs stay reachable one Tab press each. Claiming
 * the tab pattern here would describe a widget that does not exist.
 *
 * And it is opaque. iOS blurs the content sliding under its bar; this system
 * has no blur, so the bar paints a real surface and separates itself with a
 * hairline. A translucent bar with nothing behind it to blur reads as a bug,
 * not as vibrancy.
 */
export function TabBar({
  items,
  value,
  defaultValue,
  onValueChange,
  fixed = true,
  labels = true,
  separator = true,
  tone = 'tint',
  className,
  'aria-label': ariaLabel = 'Tabs',
  ...rest
}: TabBarProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value ?? '')
  const current = value ?? internal
  const reducedMotion = useReducedMotion()

  const select = (next: string) => {
    if (value === undefined) setInternal(next)
    if (next !== current) onValueChange?.(next)
  }

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      data-slot="tab-bar"
      data-tone={tone}
      data-fixed={fixed ? 'true' : undefined}
      data-separator={separator ? 'true' : undefined}
      className={cx('may-tab-bar', className)}
    >
      {items.map((item) => (
        <TabBarItemView
          key={item.value}
          item={item}
          selected={item.value === current}
          labels={labels}
          reducedMotion={reducedMotion}
          onSelect={select}
        />
      ))}
    </nav>
  )
}

interface TabBarItemViewProps {
  item: TabBarItem
  selected: boolean
  labels: boolean
  reducedMotion: boolean
  onSelect: (value: string) => void
}

/**
 * One item. Split out because the press hook cannot be called from inside a
 * `map`, and because the glyph pop needs a ref of its own.
 */
function TabBarItemView({ item, selected, labels, reducedMotion, onSelect }: TabBarItemViewProps) {
  const glyphRef = useRef<HTMLSpanElement>(null)
  const { pressProps } = usePressFeedback(item.disabled)

  /**
   * Driven from the click rather than from a selection effect, so re-tapping
   * the tab you are already on pops too — which is what iOS does, and what a
   * CSS rule keyed on `aria-current` cannot express, since the selector never
   * stops matching. WAAPI for the same reason Badge's count pop uses it: a
   * class toggle cannot restart an animation already at rest.
   */
  const pop = () => {
    const el = glyphRef.current
    if (!el || reducedMotion || typeof el.animate !== 'function') return
    el.animate([{ transform: `scale(${POP_FROM})` }, { transform: 'scale(1)' }], {
      duration: duration.settle,
      // The bouncy spring overshoots past 1, so the glyph swells past its
      // resting size on the way back and settles — the dip is what makes the
      // swell read as a bounce rather than as a resize.
      easing: resolveCurve(el, spring('bouncy')),
    })
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault()
      return
    }
    pop()
    onSelect(item.value)
  }

  const hasBadge = (item.badge != null && item.badge > 0) || item.dot === true

  const content = (
    <>
      <span ref={glyphRef} className="may-tab-bar__glyph">
        <span className="may-tab-bar__icon" aria-hidden>
          {selected && item.activeIcon ? item.activeIcon : item.icon}
        </span>
        {hasBadge && (
          /*
           * Hidden from assistive tech and folded into the item's own name
           * below instead: read in DOM order it would announce "3, Messages",
           * which is the count arriving before the thing it counts.
           */
          <span className="may-tab-bar__badge" aria-hidden>
            <Badge
              size="sm"
              tone="danger"
              variant="solid"
              {...(item.badge != null && item.badge > 0 ? { count: item.badge } : { dot: true })}
            />
          </span>
        )}
      </span>
      {labels && <span className="may-tab-bar__label">{item.label}</span>}
    </>
  )

  const shared = {
    ...pressProps,
    onClick: handleClick,
    'data-slot': 'tab-bar-item',
    // A composed name only where the label is genuinely a string; a rich node
    // keeps its own text and the count is dropped rather than mangled.
    'aria-label':
      typeof item.label === 'string' && item.badge != null && item.badge > 0
        ? `${item.label}, ${item.badge}`
        : undefined,
    'aria-current': selected ? ('page' as const) : undefined,
    className: cx('may-tab-bar__item', 'may-pressable', 'may-hoverable'),
  }

  if (item.href !== undefined) {
    return (
      <a
        {...shared}
        href={item.disabled ? undefined : item.href}
        aria-disabled={item.disabled || undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <button {...shared} type="button" disabled={item.disabled}>
      {content}
    </button>
  )
}
