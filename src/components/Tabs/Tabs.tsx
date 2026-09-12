import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { applyThumb, geometryFor } from '../../motion/sliding-thumb'
import type { MaySize } from '../../types'

/**
 * `underline` is the bar that rides under the selected tab — the macOS/iPadOS
 * shape, right above a body of content. `pill` is the capsule that slides
 * behind it, the App Store filter-chip shape.
 *
 * There is no `outline` variant, here or anywhere: a tab is never a box with a
 * stroke around it.
 */
export type TabsVariant = 'underline' | 'pill'

export type TabsOrientation = 'horizontal' | 'vertical'

/** xs is deliberately absent: a tab that small stops being a touch target. */
export type TabsSize = Exclude<MaySize, 'xs'>

interface TabsContextValue {
  value: string
  select: (value: string) => void
  orientation: TabsOrientation
  variant: TabsVariant
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) throw new Error(`<${component}> must be rendered inside <Tabs>.`)
  return context
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const tabNodes = (root: HTMLElement | null): HTMLButtonElement[] =>
  Array.from(root?.querySelectorAll<HTMLButtonElement>('[data-slot="tab"]') ?? [])

/**
 * How much the pill puffs while its own tab is pressed. Small — a tab strip's
 * pill sits closer to its neighbours than a segmented control's does.
 */
const PRESS_SCALE = 1.08

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: ReactNode
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. Falls back to the first enabled tab. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** @default 'underline' */
  variant?: TabsVariant
  /** @default 'horizontal' */
  orientation?: TabsOrientation
  /** @default 'md' */
  size?: TabsSize
}

/**
 * A tab set: `Tabs` owns the selection, `TabList` owns the indicator and the
 * arrow keys, `Tab` and `TabPanel` are the leaves.
 *
 * The indicator **slides** between tabs rather than cross-fading between two
 * copies of itself — the same technique, and the same helpers, as
 * SegmentedControl's thumb. That single detail is most of what separates a
 * native-feeling tab strip from a web one.
 */
export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  orientation = 'horizontal',
  size = 'md',
  className,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const current = value ?? internal
  const baseId = useAutoId(rest.id)

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next)
      // Fires even when unchanged is wrong; fires only on a real change is
      // what a controlled parent expects from every other control here.
      if (next !== current) onValueChange?.(next)
    },
    [current, onValueChange, value],
  )

  const context = useMemo<TabsContextValue>(
    () => ({ value: current, select, orientation, variant, baseId }),
    [current, select, orientation, variant, baseId],
  )

  return (
    <TabsContext.Provider value={context}>
      <div
        {...rest}
        data-slot="tabs"
        data-variant={variant}
        data-orientation={orientation}
        data-size={size}
        className={cx('may-tabs', className)}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Stretch the tabs to fill the track, dividing it evenly. */
  fullWidth?: boolean
}

/**
 * The strip.
 *
 * Two nested elements on purpose: the outer one scrolls, the inner one is the
 * ARIA tablist and the positioning context. Measuring against a track that
 * does not itself scroll means the indicator's geometry needs no scroll-offset
 * correction, and the underline's hairline can span the whole strip rather
 * than only the part of it currently on screen.
 */
export function TabList({
  children,
  fullWidth = false,
  className,
  onKeyDown,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: TabListProps) {
  const { value, select, orientation, variant } = useTabsContext('TabList')
  const reducedMotion = useReducedMotion()
  const axis = orientation === 'vertical' ? 'block' : 'inline'

  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const firstPaint = useRef(true)
  const lastValue = useRef<string | null>(null)
  /** True while the selected tab is held, so the pill puffs. Never state: a
   *  render per press would be wasted, and the layout effect reads it live. */
  const pressed = useRef(false)
  /** The fallback we have already asked for, so a controlled parent that
   * ignores it cannot spin us in a render loop. */
  const requested = useRef<string | null>(null)
  /** Last border-radius written to the pill. See `positionIndicator`. */
  const lastEnds = useRef('')

  const positionIndicator = useCallback(
    (animate: boolean) => {
      const track = trackRef.current
      const thumb = thumbRef.current
      if (!track || !thumb) return
      const active = track.querySelector<HTMLElement>('[data-slot="tab"][aria-selected="true"]')
      if (!active) {
        thumb.style.opacity = '0'
        return
      }
      // Only clear it when it is set: assigning to an already-absent property
      // still dirties the inline style, and the measurement below would then
      // be a forced recalc. This effect runs on every render.
      if (thumb.style.opacity) thumb.style.opacity = ''

      // Every measurement first, then every write.
      const geometry = geometryFor(track, active, axis)
      const radius =
        variant === 'pill' && geometry.width > 0
          ? (axis === 'block' ? thumb.offsetWidth : thumb.offsetHeight) / 2
          : 0

      /*
       * A pill is a capsule, and a capsule laid out at 1px and stretched carries
       * its radius stretched too — a full radius would shear across half of it.
       * Dividing the along-axis half-radius by the scale cancels that exactly,
       * at every width; the underline is a square bar and wants none of it.
       *
       * Guarded, because a border-radius change repaints the thumb's layer
       * rather than merely re-compositing it.
       */
      if (radius > 0) {
        const shrunk = `${radius / geometry.width}px`
        const ends = axis === 'block' ? `${radius}px / ${shrunk}` : `${shrunk} / ${radius}px`
        if (ends !== lastEnds.current) {
          lastEnds.current = ends
          thumb.style.borderRadius = ends
        }
      }

      applyThumb(thumb, geometry, {
        axis,
        // The underline is a thin bar; a puff on it reads as noise, so only the
        // pill takes the press scale.
        pressed: pressed.current && variant === 'pill',
        pressScale: PRESS_SCALE,
        reducedMotion: !animate,
      })
    },
    [axis, variant],
  )

  /*
   * The squish. Pressing the SELECTED tab puffs the pill and holds it until
   * release; pressing any other tab is a plain selection, and those tabs carry
   * their own `.may-pressable` feedback. No pointer tracking and no
   * `touch-action` claim — the strip scrolls, and a scroll fires pointercancel,
   * which lets the puff go.
   */
  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const tab = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-slot="tab"]')
    if (!tab || tab.getAttribute('aria-selected') !== 'true' || tab.disabled) return
    pressed.current = true
    positionIndicator(true)
    const ctrl = new AbortController()
    const release = () => {
      if (!pressed.current) return
      pressed.current = false
      positionIndicator(true)
      ctrl.abort()
    }
    window.addEventListener('pointerup', release, { signal: ctrl.signal })
    window.addEventListener('pointercancel', release, { signal: ctrl.signal })
    window.addEventListener('lostpointercapture', release, { signal: ctrl.signal })
  }

  // No dependency array: the indicator has to re-measure whenever the tabs
  // themselves change, and there is no prop that reliably announces that.
  // Measuring a handful of nodes is cheaper than a registration protocol.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const tabs = tabNodes(track)
    const active = tabs.find((tab) => tab.dataset.value === value) ?? null

    if (!active) {
      // No `value`/`defaultValue`, or the selected tab was removed. Adopt the
      // first enabled tab instead of showing a strip with nothing selected.
      const fallback = tabs.find((tab) => !tab.disabled)?.dataset.value
      if (fallback && requested.current !== fallback) {
        requested.current = fallback
        select(fallback)
      }
      positionIndicator(false)
      return
    }

    requested.current = null
    positionIndicator(!firstPaint.current && !reducedMotion)

    // Only on a real change — running this every render would fight a user
    // who is mid-scroll through a long strip.
    if (lastValue.current !== value) {
      const settled = !firstPaint.current && !reducedMotion
      lastValue.current = value
      active.scrollIntoView({
        behavior: settled ? 'smooth' : 'auto',
        inline: 'nearest',
        block: 'nearest',
      })
    }

    firstPaint.current = false
  })

  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') return
    // A resize is not a selection: snap, never slide.
    const ro = new ResizeObserver(() => positionIndicator(false))
    ro.observe(track)
    return () => ro.disconnect()
  }, [positionIndicator])

  /**
   * Roving focus with automatic activation — arrowing through tabs selects as
   * it goes, which is both the ARIA default for tabs and what a UIKit
   * segmented control does. Disabled tabs are stepped over rather than landed
   * on and skipped, so the wrap-around never dead-ends.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return

    const tabs = tabNodes(trackRef.current)
    if (tabs.length === 0) return

    const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const back = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

    const focused = tabs.indexOf(document.activeElement as HTMLButtonElement)
    const from = focused >= 0 ? focused : tabs.findIndex((tab) => tab.dataset.value === value)

    let next = -1
    if (event.key === forward || event.key === back) {
      const step = event.key === forward ? 1 : -1
      next = from < 0 ? (step > 0 ? -1 : 0) : from
      for (let i = 0; i < tabs.length; i++) {
        next = (next + step + tabs.length) % tabs.length
        if (!tabs[next]!.disabled) break
      }
    } else if (event.key === 'Home') {
      next = tabs.findIndex((tab) => !tab.disabled)
    } else if (event.key === 'End') {
      for (let i = tabs.length - 1; i >= 0; i--) {
        if (!tabs[i]!.disabled) {
          next = i
          break
        }
      }
    } else {
      return
    }

    if (next < 0 || tabs[next]!.disabled) return
    // Claimed only once a move is certain, so Escape and Enter still reach
    // whatever the strip is nested inside.
    event.preventDefault()
    tabs[next]!.focus()
    const target = tabs[next]!.dataset.value
    if (target) select(target)
  }

  return (
    <div {...rest} data-slot="tab-list" className={cx('may-tabs__list', className)}>
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-orientation={orientation}
        className={cx('may-tabs__track', fullWidth && 'may-tabs__track--full')}
        onKeyDown={handleKeyDown}
        onPointerDown={onTrackPointerDown}
      >
        <span ref={thumbRef} className="may-tabs__indicator" aria-hidden />
        {children}
      </div>
    </div>
  )
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Identity of this tab. Must match its `TabPanel`. */
  value: string
  children?: ReactNode
  /** Leading glyph, sized to the label by CSS. */
  icon?: ReactNode
  /** Trailing count or `Badge`, the way Mail hangs an unread count off a tab. */
  badge?: ReactNode
}

export function Tab({ value, children, icon, badge, className, disabled, ...rest }: TabProps) {
  const { value: selected, select, baseId } = useTabsContext('Tab')
  const isSelected = value === selected
  const { pressProps } = usePressFeedback(disabled)

  return (
    <button
      {...rest}
      {...pressProps}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={isSelected}
      // Roving tabindex: the strip is one Tab stop, and the arrow keys move
      // within it. A strip of eight tabs must not cost eight Tab presses.
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      data-slot="tab"
      data-value={value}
      onClick={() => select(value)}
      className={cx('may-tabs__tab', 'may-pressable', 'may-hoverable', className)}
    >
      {icon && (
        <span className="may-tabs__tab-icon" aria-hidden>
          {icon}
        </span>
      )}
      {children != null && <span className="may-tabs__tab-label">{children}</span>}
      {badge != null && <span className="may-tabs__tab-badge">{badge}</span>}
    </button>
  )
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Identity of the tab this panel belongs to. */
  value: string
  children?: ReactNode
  /**
   * Keep the panel in the DOM while another tab is selected. Costs the render
   * but preserves scroll position and uncommitted form state.
   */
  keepMounted?: boolean
}

export function TabPanel({
  value,
  children,
  keepMounted = false,
  className,
  ...rest
}: TabPanelProps) {
  const { value: selected, baseId } = useTabsContext('TabPanel')
  const isSelected = value === selected

  if (!isSelected && !keepMounted) return null

  return (
    <div
      {...rest}
      id={`${baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${value}`}
      // A panel can hold more than fits, and only Firefox focuses an overflow
      // container on its own — without this a keyboard user cannot scroll it.
      tabIndex={0}
      hidden={!isSelected}
      data-slot="tab-panel"
      className={cx('may-tabs__panel', className)}
    >
      {children}
    </div>
  )
}
