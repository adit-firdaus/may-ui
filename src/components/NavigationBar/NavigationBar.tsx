import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
// A value import: the back button IS a Button, so its stylesheet has to travel
// with this one. A type-only import is erased at compile time and the bundler
// then code-splits those rules away from a page that only renders a nav bar.
import { Button } from '../Button/Button'
import './NavigationBar.css'

export interface NavigationBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The view's title. Shown inline, and again as the large title when asked. */
  title: ReactNode
  /** Quiet second line under the inline title — "Updated Just Now". */
  subtitle?: ReactNode
  /**
   * Render the large title below the bar, collapsing into the inline title as
   * its scroll container moves.
   */
  largeTitle?: boolean
  /** Leading slot. Replaced by the back button when `onBack` is given alone. */
  leading?: ReactNode
  /** Trailing slot — usually one or two `IconButton`s. */
  trailing?: ReactNode
  /** Renders the iOS back button into the leading slot. */
  onBack?: () => void
  /** @default 'Back' */
  backLabel?: ReactNode
  /**
   * The scroll container driving the collapse. Omit to listen on the window,
   * which is right for a whole-page scroll.
   */
  scrollRef?: RefObject<HTMLElement | null>
  /** @default true */
  sticky?: boolean
  /** Pad past the notch and the landscape rounded corners. @default true */
  safeArea?: boolean
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d="M10 3L5 8L10 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The iOS navigation bar.
 *
 * The large title collapses into the inline one as the content scrolls under
 * it, and the whole effect is driven by a **single custom property** that a
 * passive scroll listener writes at most once per frame. Nothing about the
 * collapse goes through React state: a `setState` per scroll event would
 * re-render the bar and everything inside it sixty times a second, which is
 * how a ported nav bar ends up janky on the exact devices it is imitating.
 *
 * There is no vibrancy here and no blur — the bar is an opaque surface, and
 * the hairline that appears once you have scrolled is what separates it from
 * the content passing underneath.
 */
export function NavigationBar({
  title,
  subtitle,
  largeTitle = false,
  leading,
  trailing,
  onBack,
  backLabel = 'Back',
  scrollRef,
  sticky = true,
  safeArea = true,
  className,
  ...rest
}: NavigationBarProps) {
  const rootRef = useRef<HTMLElement>(null)
  /** The uncollapsed large title. Its height is the scroll distance. */
  const largeTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Resolved once: refs are attached during commit, so an ancestor scroll
    // container is already there by the time a passive effect runs.
    const container = scrollRef?.current ?? null
    const target: EventTarget = container ?? window

    let frame = 0
    let lastDistance = -1
    let lastScrolled: boolean | null = null

    const read = () => {
      frame = 0
      const y = container ? container.scrollTop : window.scrollY

      // Measured on the INNER title, which never collapses. Measuring the
      // wrapper would feed its own shrinking height back into the distance and
      // the collapse would chase itself.
      const distance = largeTitleRef.current?.offsetHeight ?? 0
      if (distance !== lastDistance) {
        lastDistance = distance
        root.style.setProperty('--may-nav-large-h', `${distance}px`)
      }

      const progress = distance > 0 ? Math.min(1, Math.max(0, y / distance)) : 0
      root.style.setProperty('--may-nav-progress', progress.toFixed(3))

      // An attribute write invalidates style for the subtree, so it happens
      // only on the frame the answer actually changes.
      const scrolled = y > 0
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled
        root.toggleAttribute('data-scrolled', scrolled)
      }
    }

    /** Coalesced to one DOM write per frame; scroll events arrive faster. */
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    target.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      target.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [scrollRef, largeTitle])

  const back = onBack && (
    <Button
      variant="plain"
      tone="tint"
      // The bar button is a real 44pt target, not a text link: `sm` would
      // draw it under the minimum with nothing to make the difference up.
      size="md"
      onClick={onBack}
      leadingIcon={<BackChevron />}
      className="may-nav-bar__back"
    >
      {backLabel}
    </Button>
  )

  return (
    <header
      {...rest}
      ref={rootRef}
      data-slot="nav-bar"
      data-large-title={largeTitle ? 'true' : undefined}
      data-sticky={sticky ? 'true' : undefined}
      data-safe-area={safeArea ? 'true' : undefined}
      className={cx('may-nav-bar', className)}
    >
      <div className="may-nav-bar__bar">
        <div className="may-nav-bar__side may-nav-bar__side--leading">{leading ?? back}</div>

        <div className="may-nav-bar__title">
          {largeTitle ? (
            // The large title below is the real heading; this one is its
            // visual twin, so announcing both would read the view's name
            // twice.
            <span className="may-nav-bar__title-text" aria-hidden>
              {title}
            </span>
          ) : (
            <h1 className="may-nav-bar__title-text">{title}</h1>
          )}
          {subtitle && <span className="may-nav-bar__subtitle">{subtitle}</span>}
        </div>

        <div className="may-nav-bar__side may-nav-bar__side--trailing">{trailing}</div>
      </div>

      {largeTitle && (
        <div className="may-nav-bar__large">
          <h1 ref={largeTitleRef} className="may-nav-bar__large-title">
            {title}
          </h1>
        </div>
      )}
    </header>
  )
}
