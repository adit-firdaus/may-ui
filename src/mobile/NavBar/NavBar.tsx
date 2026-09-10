import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { IoChevronBack } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './NavBar.css'

export interface NavBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Centre title. Truncates rather than wrapping — a nav bar is one line tall. */
  title?: ReactNode
  /** Back handler. Its presence is what draws the chevron. */
  onBack?: () => void
  /** Renders the back affordance as a real `<a>` instead of a button. */
  backHref?: string
  /** Text beside the chevron — the previous screen's title, the way iOS labels it. */
  backLabel?: ReactNode
  /** Accessible name when the chevron stands alone. @default 'Back' */
  backAriaLabel?: string
  /** Leading content. Replaces the back affordance when both are supplied. */
  leading?: ReactNode
  /** Trailing actions — an `IconButton`, a plain `Button`, or a few of them. */
  trailing?: ReactNode
  /** Draw the hairline between the bar and the content below it. @default true */
  separator?: boolean
  /**
   * `sticky` keeps the bar at the top of its own scroll container, which is
   * what a phone screen wants. `fixed` pins it to the viewport; `static` lets
   * it scroll away with the content. @default 'sticky'
   */
  position?: 'static' | 'sticky' | 'fixed'
  /**
   * `surface` paints an opaque background, which any bar with content moving
   * under it needs — this system has no blur to hide behind. `plain` is
   * transparent, for a screen that scrolls its own colour up to the bar.
   * @default 'surface'
   */
  variant?: 'surface' | 'plain'
  /** Slide the bar away on the way down and bring it back on the way up. */
  hideOnScroll?: boolean
  /** Scroll container to watch. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>
}

/**
 * Movement below this is a rubber-band settle or a finger tremor, not intent.
 * Reacting to it makes the bar flicker on every micro-scroll.
 */
const INTENT_PX = 8

/**
 * The phone navigation bar.
 *
 * The title is centred against the *bar*, not against the space left over
 * between the two sides: the layout is a three-track grid whose outer tracks
 * share the free space equally, so a trailing action does not drag the title
 * off-centre. It truncates before it can reach either side.
 */
export function NavBar({
  title,
  onBack,
  backHref,
  backLabel,
  backAriaLabel = 'Back',
  leading,
  trailing,
  separator = true,
  position = 'sticky',
  variant = 'surface',
  hideOnScroll = false,
  scrollRef,
  className,
  ...rest
}: NavBarProps) {
  const rootRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    /*
     * A bar that vanishes is motion, not decoration: shortening the transition
     * does not make it acceptable to someone who asked for less of it, because
     * the objectionable part is the disappearance, not its duration. So under
     * reduced motion the bar simply stays.
     */
    if (!hideOnScroll || reducedMotion) {
      setHidden(false)
      return
    }

    const el = scrollRef?.current ?? null
    const target: EventTarget = el ?? window
    const readY = () => (el ? el.scrollTop : window.scrollY)
    const barHeight = rootRef.current?.offsetHeight ?? 0

    let last = readY()
    let frame = 0

    const onScroll = () => {
      // Scroll fires far faster than the screen refreshes; one read per frame
      // is both enough and cheaper, since reading scrollTop is a layout query.
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = readY()
        const delta = y - last
        if (Math.abs(delta) < INTENT_PX) return
        last = y
        // Never hide inside the bar's own height: at the top of a screen the
        // bar is part of the layout, and hiding it there reads as a glitch.
        setHidden(delta > 0 && y > barHeight)
      })
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [hideOnScroll, reducedMotion, scrollRef])

  const back =
    leading ??
    (onBack || backHref ? (
      <BackButton
        onBack={onBack}
        href={backHref}
        label={backLabel}
        ariaLabel={backLabel == null ? backAriaLabel : undefined}
      />
    ) : null)

  return (
    <header
      {...rest}
      ref={rootRef}
      data-slot="nav-bar"
      data-variant={variant}
      data-position={position}
      data-separator={separator ? 'true' : undefined}
      data-hidden={hidden ? 'true' : undefined}
      className={cx('may-nav-bar', className)}
    >
      <div className="may-nav-bar__row">
        <div className="may-nav-bar__side may-nav-bar__side--leading">{back}</div>
        {/*
         * An `h1`, not a styled span: on a phone the bar's title *is* the
         * screen's heading, and it is the landmark a screen-reader user jumps
         * to first. The UA's margin and size are reset in CSS.
         */}
        {title != null && <h1 className="may-nav-bar__title">{title}</h1>}
        <div className="may-nav-bar__side may-nav-bar__side--trailing">{trailing}</div>
      </div>
    </header>
  )
}

interface BackButtonProps {
  onBack?: () => void
  href?: string
  label?: ReactNode
  ariaLabel?: string
}

/**
 * Chevron plus an optional label. A real `<button>` — or a real `<a>` when it
 * carries an href — never a div with a click handler: a div is invisible to
 * keyboard and switch-access users, who have no way to focus or activate it.
 */
function BackButton({ onBack, href, label, ariaLabel }: BackButtonProps) {
  const { pressProps } = usePressFeedback()

  const content = (
    <>
      <IoChevronBack className="may-nav-bar__chevron" aria-hidden focusable="false" />
      {label != null && <span className="may-nav-bar__back-label">{label}</span>}
    </>
  )

  const shared = {
    ...pressProps,
    'data-slot': 'nav-bar-back',
    'aria-label': ariaLabel,
    className: cx('may-nav-bar__back', 'may-pressable', 'may-hoverable'),
  }

  if (href !== undefined) {
    return (
      <a {...shared} href={href} onClick={onBack}>
        {content}
      </a>
    )
  }

  return (
    <button {...shared} type="button" onClick={onBack}>
      {content}
    </button>
  )
}
