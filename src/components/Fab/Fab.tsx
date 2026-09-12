import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef, isValidElement } from 'react'
import { cx } from '../../utils/cx'
import { renderAsChild } from '../../utils/asChild'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize, MayTone } from '../../types'

export interface FabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /**
   * Render this control's presentation onto its child instead of a `<button>`,
   * so a router `<Link>` can wear it without losing the anchor. The child's own
   * props win; `className` is merged. `type`/`disabled` are not forwarded —
   * neither is valid on an `<a>` — and a disabled child gets `aria-disabled`.
   * @default false
   */
  asChild?: boolean

  /**
   * The glyph, and it stays a ReactNode — a consumer's slot, never a fixed
   * icon. Either shape is sized to the control by CSS: a bare `<svg>` with no
   * width attribute, or an Ionicon from `react-icons/io5` at its default size
   * (`width="1em"`). Both land on 1.35em. Pass `size` to opt out.
   */
  icon: ReactNode
  /** An optional label, which extends the circle into a pill. */
  children?: ReactNode
  /**
   * Required, not optional. A FAB is icon-first, and even the extended form
   * carries a label short enough ("New", "Compose") to be worth spelling out
   * for a screen reader.
   */
  'aria-label': string
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  /** Pin to a corner of the viewport, clear of the home indicator. */
  fixed?: boolean
  /** Which corner, when `fixed`. @default 'end' */
  position?: 'start' | 'center' | 'end'
  loading?: boolean
}

/**
 * The floating action button.
 *
 * It is the one control in the system that genuinely floats, and everything
 * about it says so. It arrives with a spring rather than appearing; hovering
 * lifts it and deepens its shadow; pressing pushes it down towards the surface,
 * shrinking the scale and contracting the shadow *together* — two properties
 * moving as one is what sells depth, and moving only the scale is what makes a
 * ported FAB read as a flat circle that happens to animate.
 *
 * `fixed` pins it clear of the home indicator using the safe-area tokens, so it
 * never lands under the gesture bar on a phone.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  {
    icon,
    children,
    asChild = false,
    tone = 'tint',
    size = 'md',
    fixed = false,
    position = 'end',
    loading = false,
    disabled,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading
  const { pressProps } = usePressFeedback(isDisabled)
  /*
   * Extended means "carries a label". Under `asChild` the label is the child's
   * own children, not `children` — which is the element itself and so always
   * present. Reading it from the wrong place would draw every Fab-as-link in
   * the extended shape, including icon-only ones.
   */
  const label = asChild && isValidElement(children)
    ? (children.props as { children?: ReactNode }).children
    : children
  const extended = label != null

  const presentation = {
    'data-slot': 'fab',
    'data-tone': tone,
    'data-size': size,
    'data-position': position,
    className: cx(
      'may-fab',
      'may-pressable',
      'may-hoverable',
      extended && 'may-fab--extended',
      fixed && 'may-fab--fixed',
      className,
    ),
  }

  const glyph = loading ? (
    <span className="may-fab__spinner" aria-hidden />
  ) : (
    <span className="may-fab__glyph" aria-hidden>
      {icon}
    </span>
  )

  if (asChild) {
    return renderAsChild(
      children,
      { ...rest, ...pressProps, ref, ...presentation, 'aria-busy': loading || undefined, 'aria-disabled': isDisabled || undefined },
      (label) => (
        <>
          {glyph}
          {label != null && <span className="may-fab__label">{label}</span>}
        </>
      ),
    )
  }

  return (
    <button
      {...rest}
      {...pressProps}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...presentation}
    >
      {glyph}
      {extended && <span className="may-fab__label">{children}</span>}
    </button>
  )
})
