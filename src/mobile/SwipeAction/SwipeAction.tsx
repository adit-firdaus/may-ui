import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from 'react'
import { useEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { draggable, projectFlick, rubber } from '../../motion/gesture'
import { duration } from '../../motion/springs'
import type { MayTone } from '../../types'

/** Which edge of the row the actions live on. */
export type SwipeSide = 'leading' | 'trailing'

export interface SwipeActionItem {
  label: string
  onSelect: () => void
  /** Glyph above the label. A bare `<svg>` is scaled to the tile by CSS. */
  icon?: ReactNode
  /** @default 'neutral' */
  tone?: MayTone
}

export interface SwipeActionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The row itself — typically a `ListRow`. */
  children: ReactNode
  /**
   * Revealed by dragging the row toward its trailing edge. **The first item is
   * the one that ends up against the display edge**, so it is the one the eye
   * lands on first and the one a full swipe fires.
   */
  leading?: SwipeActionItem[]
  /** Revealed by dragging toward the leading edge. First item is the primary. */
  trailing?: SwipeActionItem[]
  /** Dragging most of the way across fires that group's primary action. @default true */
  fullSwipe?: boolean
  disabled?: boolean
  onOpenChange?: (side: SwipeSide | null) => void
}

/** Movement below this is still a tap. Matches `draggable`'s own threshold. */
const TAP_SLOP = 4
/** Fraction of a group's own width that has to be uncovered for it to stay open. */
const OPEN_RATIO = 0.5
/** Fraction of the ROW's width at which the full swipe arms. */
const FULL_RATIO = 0.5

/**
 * How wide a group wants to be when it is fully open.
 *
 * Read from `flex-basis` rather than from the elements' own boxes: the actions
 * are squeezed to whatever the drag has uncovered so far, so their measured
 * width answers a different question. `getComputedStyle` resolves the basis —
 * itself a calc() over --may-control-h — to real pixels, which keeps the number
 * JS works with derived from the same token the CSS draws with.
 */
function openWidth(group: HTMLElement | null): number {
  if (!group) return 0
  let total = 0
  for (const child of Array.from(group.children)) {
    const basis = parseFloat(getComputedStyle(child).flexBasis)
    total += Number.isFinite(basis) ? basis : (child as HTMLElement).offsetWidth
  }
  return total
}

/**
 * iOS swipe-to-reveal row actions.
 *
 * The row tracks the finger, meets rubber-band resistance past the end of the
 * actions, and — dragged most of the way across — fires the primary action
 * directly, with the other actions collapsing under it as it takes the row.
 *
 * The actions are not slid in from off-screen: each group is pinned to its own
 * display edge and widens as the row uncovers it, so the labels stay centred in
 * tiles that grow rather than sliding past a window. That is the detail that
 * separates this from a carousel wearing a row's clothes.
 */
export function SwipeAction({
  children,
  leading,
  trailing,
  fullSwipe = true,
  disabled = false,
  onOpenChange,
  className,
  ...rest
}: SwipeActionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const leadRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  const [side, setSide] = useState<SwipeSide | null>(null)
  const [open, setOpen] = useState<SwipeSide | null>(null)
  const [armed, setArmed] = useState(false)
  const [dragging, setDragging] = useState(false)

  /*
   * The gesture writes the offset straight to the DOM: one transform and one
   * custom property per frame, rather than a re-render of a row that may be
   * carrying an avatar, a switch and three lines of text.
   */
  const offset = useRef(0)
  const dragged = useRef(false)
  const sideRef = useRef<SwipeSide | null>(null)
  const armedRef = useRef(false)
  const openRef = useRef<SwipeSide | null>(null)
  const settling = useRef<ReturnType<typeof setTimeout> | null>(null)

  /*
   * Volatile props, mirrored into a ref that is refreshed on every render. The
   * drag listener must be attached exactly once — re-running the effect because
   * a caller passed a fresh `trailing` array would tear the listener out from
   * under a finger that is mid-swipe.
   */
  const latest = useRef({ leading, trailing, fullSwipe, onOpenChange })
  useEffect(() => {
    latest.current = { leading, trailing, fullSwipe, onOpenChange }
  })

  useEffect(
    () => () => {
      if (settling.current) clearTimeout(settling.current)
    },
    [],
  )

  const apply = (next: number) => {
    const root = rootRef.current
    const content = contentRef.current
    if (!root || !content) return
    offset.current = next
    // The group's width IS the reveal, so the tiles can never fall short of the
    // gap the row has opened — there is nothing behind them to show through.
    root.style.setProperty('--may-swipe-reveal', `${Math.abs(next)}px`)
    content.style.transform = `translate3d(${next}px, 0, 0)`
  }

  const arm = (next: boolean) => {
    if (armedRef.current === next) return
    armedRef.current = next
    setArmed(next)
  }

  const face = (next: SwipeSide) => {
    if (sideRef.current === next) return
    sideRef.current = next
    setSide(next)
  }

  const commit = (next: SwipeSide | null) => {
    if (openRef.current === next) return
    openRef.current = next
    setOpen(next)
    latest.current.onOpenChange?.(next)
  }

  const close = () => {
    apply(0)
    arm(false)
    commit(null)
  }

  const openTo = (target: SwipeSide, dir: number, room: number) => {
    face(target)
    apply(dir * (target === 'leading' ? room : -room))
    commit(target)
  }

  const fire = (target: SwipeSide, dir: number, width: number) => {
    const items = target === 'leading' ? latest.current.leading : latest.current.trailing
    const primary = items?.[0]
    if (!primary) {
      close()
      return
    }
    // Carry the row the whole way before running the action: in Mail the swipe
    // is what happened to the message, and the tile is only how it was aimed.
    apply(dir * (target === 'leading' ? width : -width))
    primary.onSelect()
    if (settling.current) clearTimeout(settling.current)
    // If the caller removed the row this never lands on a live node. If it kept
    // the row, it comes back once the travel has been seen.
    settling.current = setTimeout(close, duration.settle)
  }

  /* The drag. Attached to the content rather than the root, so a press that
   * lands on a revealed action is that button's press and not a new swipe. */
  useEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    if (!root || !content || disabled) return

    let dir = 1
    let width = 0
    let lead = 0
    let trail = 0
    let from = 0

    return draggable(content, {
      /*
       * 'both', not 'x'. The axis lock is the whole point: a vertical scroll
       * that happens to start on a row reports dx = 0 for the rest of the
       * gesture, so a finger that meant to scroll can never drag the row
       * sideways by the few pixels a thumb wanders.
       */
      axis: 'both',
      onStart: () => {
        // Under RTL the leading edge is on the right, so a rightward drag
        // uncovers the trailing group. The CSS mirrors itself through logical
        // properties; only this sign has to be told about it.
        dir = getComputedStyle(root).direction === 'rtl' ? -1 : 1
        width = root.offsetWidth
        lead = openWidth(leadRef.current)
        trail = openWidth(trailRef.current)
        from = offset.current
        dragged.current = false
        setDragging(true)
      },
      onMove: ({ dx }) => {
        if (!dragged.current) {
          if (Math.abs(dx) <= TAP_SLOP) return
          dragged.current = true
        }
        const raw = from + dx
        const magnitude = Math.abs(raw)
        const sign = Math.sign(raw)
        const towards: SwipeSide = raw * dir >= 0 ? 'leading' : 'trailing'
        const room = towards === 'leading' ? lead : trail
        const full = latest.current.fullSwipe !== false && room > 0

        let next: number
        if (room === 0) {
          // Nothing to reveal on that side: the row gives a little and no more.
          next = sign * rubber(magnitude)
        } else if (full) {
          // A full swipe may take the whole row; only the far edge resists.
          next = magnitude <= width ? raw : sign * (width + rubber(magnitude - width))
        } else {
          next = magnitude <= room ? raw : sign * (room + rubber(magnitude - room))
        }

        if (magnitude > 0) face(towards)
        arm(full && magnitude >= width * FULL_RATIO)
        apply(next)
      },
      onEnd: ({ vx }) => {
        setDragging(false)
        if (!dragged.current) return // a tap; the resting state is not ours to change
        const at = offset.current
        const towards: SwipeSide = at * dir >= 0 ? 'leading' : 'trailing'
        const room = towards === 'leading' ? lead : trail
        if (at === 0 || room === 0) {
          close()
          return
        }
        if (armedRef.current) {
          fire(towards, dir, width)
          return
        }
        // Distance alone under-reads a flick: a short, fast swipe should open.
        const projected = at + projectFlick(vx)
        const decisive =
          Math.sign(projected) === Math.sign(at) && Math.abs(projected) >= room * OPEN_RATIO
        if (decisive) openTo(towards, dir, room)
        else close()
      },
    })
  }, [disabled])

  /*
   * A gesture-only control is unusable without a pointer. Arrow keys move the
   * row the way they point — which uncovers the group on the other side of it —
   * and Escape puts it back, so the actions can be reached from a keyboard or a
   * switch once the row itself has focus.
   */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (disabled || !root) return
    if (event.key === 'Escape' && openRef.current) {
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const dir = getComputedStyle(root).direction === 'rtl' ? -1 : 1
    const towards: SwipeSide = (event.key === 'ArrowRight') === (dir === 1) ? 'leading' : 'trailing'
    const room = openWidth(towards === 'leading' ? leadRef.current : trailRef.current)
    if (!room) return
    event.preventDefault()
    if (openRef.current === towards) close()
    else openTo(towards, dir, room)
  }

  const guardClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // detail is 0 for a click synthesised from a keypress, which no drag can
    // have produced and which must never be swallowed.
    if (dragged.current && event.detail > 0) {
      dragged.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (openRef.current) {
      // iOS puts an open row away on the next tap rather than activating it.
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }

  const forwardClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const content = contentRef.current
    if (!content || event.target !== content) return
    /*
     * `draggable` takes pointer capture for every press, and a captured pointer
     * retargets its own release — so a plain tap arrives here instead of on the
     * row inside, and a `ListRow` wrapped in a SwipeAction would quietly stop
     * responding. Hand the click back down. (Toast solves the same problem by
     * refusing capture for presses that begin on a control; a swipe row cannot,
     * because the row IS the control being swiped.) The forwarded click carries
     * its own target, so it passes the guard above rather than looping.
     */
    const under = document.elementFromPoint(event.clientX, event.clientY)
    const target = under?.closest('button, a, [role="button"]')
    if (target instanceof HTMLElement && target !== content && content.contains(target)) {
      target.click()
    }
  }

  const group = (
    items: SwipeActionItem[] | undefined,
    groupSide: SwipeSide,
    ref: RefObject<HTMLDivElement | null>,
  ) => {
    if (!items || items.length === 0) return null
    const revealed = open === groupSide
    return (
      <div
        ref={ref}
        className="may-swipe__group"
        data-side={groupSide}
        /* Clipped to nothing until the row is dragged, so it is out of the
         * reading order too — otherwise Tab lands on a button that is a zero
         * pixels wide and invisible. */
        aria-hidden={revealed ? undefined : true}
      >
        {items.map((item, index) => (
          <SwipeActionTile
            key={`${item.label}-${index}`}
            item={item}
            primary={index === 0}
            reachable={revealed}
            onDone={close}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      data-slot="swipe-action"
      data-side={side ?? undefined}
      data-armed={armed ? 'true' : undefined}
      data-dragging={dragging ? 'true' : undefined}
      className={cx('may-swipe', className)}
      onKeyDown={onKeyDown}
    >
      {group(leading, 'leading', leadRef)}
      {group(trailing, 'trailing', trailRef)}
      <div
        ref={contentRef}
        className="may-swipe__content"
        onClickCapture={guardClick}
        onClick={forwardClick}
      >
        {children}
      </div>
    </div>
  )
}

/** One action tile. Its own component so it can hold its own press state. */
function SwipeActionTile({
  item,
  primary,
  reachable,
  onDone,
}: {
  item: SwipeActionItem
  primary: boolean
  reachable: boolean
  onDone: () => void
}) {
  const { pressProps } = usePressFeedback()

  return (
    <button
      {...pressProps}
      type="button"
      tabIndex={reachable ? undefined : -1}
      data-tone={item.tone ?? 'neutral'}
      data-primary={primary ? 'true' : undefined}
      className="may-swipe__action may-pressable may-hoverable"
      onClick={() => {
        item.onSelect()
        // The row closes behind its own action, the way Mail's does.
        onDone()
      }}
    >
      <span className="may-swipe__action-inner">
        {item.icon && (
          <span className="may-swipe__action-icon" aria-hidden>
            {item.icon}
          </span>
        )}
        <span className="may-swipe__action-label">{item.label}</span>
      </span>
    </button>
  )
}
