import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Sheet } from '../../components/Sheet'
/* Value import, not type-only: Popup styles Sheet's own class names, and a
 * type-only import is erased at compile time — Storybook would then code-split
 * Sheet.css away and render the popup unstyled. It also fixes the cascade
 * order, so Popup.css (imported below) always lands after the rules it pins. */

export interface PopupProps {
  /** Phone-shaped naming for what `Sheet` calls `open`. */
  visible: boolean
  onClose: () => void
  children?: ReactNode
  /**
   * Which edge the panel is attached to.
   * @default 'bottom'
   */
  position?: 'bottom' | 'top'
  /**
   * Fixed panel height. A number is treated as px; a string is any CSS length
   * (`'60%'`, `'22rem'`, `'50dvh'`). Omit it to size to the content.
   */
  height?: number | string
  /** @default true */
  closeOnMaskClick?: boolean
  /** The drag handle. Bottom popups only — see the note on `position`. @default true */
  grabber?: boolean
  /**
   * Pad the attached edge by the device's safe-area inset, so content clears
   * the home indicator (bottom) or the status bar / notch (top).
   * @default true
   */
  safeArea?: boolean
  /**
   * Accessible name. A Popup usually has no visible title — it is a container
   * other components fill — but a dialog with no name is unusable in a screen
   * reader, so pass one whenever the content does not speak for itself.
   */
  title?: ReactNode
  /**
   * Inset the content by the standard sheet gutter. Off by default: a Popup is
   * a *primitive* other mobile components compose over — a picker, a filter
   * panel, a grouped list — and those want to reach the edges themselves.
   * @default false
   */
  padded?: boolean
  className?: string
}

/** Normalise `height` the way React normalises a numeric style value. */
const toLength = (value: number | string) => (typeof value === 'number' ? `${value}px` : value)

/**
 * The phone bottom sheet — the primitive other mobile components present over.
 *
 * Per the reuse ladder this is a thin prop-shape adapter over the adaptive
 * `Sheet`, not a second implementation. The drag-to-dismiss gesture, the focus
 * trap, the scroll lock, the Escape handling and the scrim all stay in exactly
 * one place; duplicating the gesture here is how two sheets end up dismissing
 * at subtly different velocities.
 *
 * Popup adds three things Sheet does not:
 *
 *   1. the phone-centric prop shape (`visible`, `closeOnMaskClick`) that the
 *      rest of `mayui/mobile` is written against;
 *   2. a top edge, which an adaptive sheet has no use for;
 *   3. presentation pinned to the phone shape at every viewport width.
 *
 * (3) is done in CSS rather than by threading a `presentation` prop through
 * Sheet, because Sheet's presentation is a media query rather than state:
 * `useIsDesktop` is the question a *consumer* asks, and a phone-only primitive
 * has already answered it. One consequence is worth naming rather than hiding:
 * Sheet attaches its drag on the phone branch only, so at a desktop-width
 * viewport a Popup keeps the phone shape but does not drag. That is the right
 * trade for a component that only ever ships inside `mayui/mobile`.
 */
export function Popup({
  visible,
  onClose,
  children,
  position = 'bottom',
  height,
  closeOnMaskClick = true,
  grabber = true,
  safeArea = true,
  title,
  padded = false,
  className,
}: PopupProps) {
  /*
   * Sheet's drag only resolves downward, so it is meaningful for a panel
   * attached to the bottom edge and actively wrong for one attached to the
   * top — there, pulling down would drag the panel further *into* the screen
   * and then dismiss it. A top popup is therefore never draggable, and drops
   * the grabber with it: the grabber is the affordance that promises a drag.
   */
  const draggable = position === 'bottom'

  return (
    <div
      data-slot="popup"
      data-position={position}
      data-safe-area={safeArea ? 'true' : 'false'}
      data-padded={padded ? 'true' : undefined}
      className="may-popup-host"
      style={height !== undefined ? ({ '--may-popup-h': toLength(height) } as CSSProperties) : undefined}
    >
      <Sheet
        open={visible}
        onClose={onClose}
        title={title}
        grabber={grabber && draggable}
        dismissible={draggable}
        closeOnScrimClick={closeOnMaskClick}
        className={cx('may-popup', className)}
      >
        {children}
      </Sheet>
    </div>
  )
}
