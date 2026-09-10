import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useLinkComponent } from '../../hooks/link'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { duration, resolveCurve, spring } from '../../motion/springs'
import { useSlidingThumb } from '../../motion/useSlidingThumb'
import { Badge } from '../../components/Badge'
import type { MayTone } from '../../types'
import './TabBar.css'

/** A whisper of a puff — the glyph's own pop carries most of the press. */
const PRESS_SCALE = 1.06

export interface TabBarItem<T extends string = string> {
  /** Identity of the tab — what `onValueChange` reports. */
  value: T
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

export interface TabBarProps<T extends string = string> extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: TabBarItem<T>[]
  /** Controlled selection. */
  value?: T
  /** Uncontrolled initial selection. Falls back to the first item. */
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** Float the bar above the bottom edge of the viewport. @default true */
  fixed?: boolean
  /** Keep the labels under the glyphs. Off is iOS's compact landscape bar. @default true */
  labels?: boolean
  /** Tint of the selected item. @default 'tint' */
  tone?: MayTone
  /**
   * The detached control beside the capsule — search in Phone, compose in
   * Notes. Anything at all: an `IconButton`, a `Fab`, a `SearchField`. The bar
   * owns where it sits and how far it sits from the capsule; you own what it
   * is. Omit it and the capsule centres alone.
   */
  children?: ReactNode
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
export function TabBar<T extends string = string>({
  items = [],
  value,
  defaultValue,
  onValueChange,
  fixed = true,
  labels = true,
  tone = 'tint',
  children,
  className,
  'aria-label': ariaLabel = 'Tabs',
  ...rest
}: TabBarProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? items[0]?.value)
  const current = value ?? internal
  const reducedMotion = useReducedMotion()

  const select = (next: T) => {
    if (value === undefined) setInternal(next)
    if (next !== current) onValueChange?.(next)
  }

  /*
   * A selection pill that SLIDES between items rather than a tint switching on
   * and off. Press-only: a tab bar is tapped, and a drag-to-select over a row
   * that may be `<a>` links would race their navigation. The squish is a
   * whisper — the glyph's own WAAPI pop already answers the tap.
   */
  const { trackRef, thumbRef, registerItem, onPointerDown } = useSlidingThumb<
    HTMLDivElement,
    HTMLElement
  >({
    itemCount: items.length,
    selectedIndex: Math.max(
      0,
      items.findIndex((item) => item.value === current),
    ),
    roundEnds: true,
    pressScale: PRESS_SCALE,
  })

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      data-slot="tab-bar"
      data-tone={tone}
      data-fixed={fixed ? 'true' : undefined}
      className={cx('may-tab-bar', className)}
    >
      {/* The nav is a frame, not the bar you can see: it spans the width so the
        * capsule and the detached control can be laid out against each other,
        * and lets pointers through everywhere it is empty. */}
      <div ref={trackRef} className="may-tab-bar__capsule" onPointerDown={onPointerDown}>
        <span ref={thumbRef} className="may-tab-bar__thumb" aria-hidden />
        {items.map((item, index) => (
          <TabBarItemView
            key={item.value}
            item={item}
            selected={item.value === current}
            labels={labels}
            reducedMotion={reducedMotion}
            itemRef={registerItem(index)}
            onSelect={select}
          />
        ))}
      </div>
      {children != null && <div className="may-tab-bar__action">{children}</div>}
    </nav>
  )
}

interface TabBarItemViewProps<T extends string = string> {
  item: TabBarItem<T>
  selected: boolean
  labels: boolean
  reducedMotion: boolean
  itemRef: (node: HTMLElement | null) => void
  onSelect: (value: T) => void
}

/**
 * One item. Split out because the press hook cannot be called from inside a
 * `map`, and because the glyph pop needs a ref of its own.
 */
function TabBarItemView<T extends string = string>({
  item,
  selected,
  labels,
  reducedMotion,
  itemRef,
  onSelect,
}: TabBarItemViewProps<T>) {
  const Link = useLinkComponent()
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
    ref: itemRef,
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
    // The provider's link element, so a tab tap routes instead of reloading.
    return (
      <Link
        {...shared}
        href={item.disabled ? undefined : item.href}
        aria-disabled={item.disabled || undefined}
      >
        {content}
      </Link>
    )
  }

  return (
    <button {...shared} type="button" disabled={item.disabled}>
      {content}
    </button>
  )
}
