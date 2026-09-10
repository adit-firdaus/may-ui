import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize, MayTone } from '../../types'
import './Fab.css'

export interface FabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** The glyph. A bare `<svg>` is scaled to the control by CSS. */
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
  const extended = children != null

  return (
    <button
      {...rest}
      {...pressProps}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-slot="fab"
      data-tone={tone}
      data-size={size}
      data-position={position}
      className={cx(
        'may-fab',
        'may-pressable',
        'may-hoverable',
        extended && 'may-fab--extended',
        fixed && 'may-fab--fixed',
        className,
      )}
    >
      {loading ? (
        <span className="may-fab__spinner" aria-hidden />
      ) : (
        <span className="may-fab__glyph" aria-hidden>
          {icon}
        </span>
      )}
      {extended && <span className="may-fab__label">{children}</span>}
    </button>
  )
})
