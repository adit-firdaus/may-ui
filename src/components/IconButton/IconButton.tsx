import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { renderAsChild } from '../../utils/asChild'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize, MayTone } from '../../types'
import type { ButtonVariant } from '../Button/Button'
/*
 * A value import, deliberately, even though nothing here reads a JS export from
 * Button: IconButton renders with Button's own `.may-button` variant and tone
 * rules. A type-only import is erased at compile time, and the bundler then
 * code-splits those rules away from anything that only ever renders an
 * IconButton — which paints an unstyled square.
 */
import '../Button/Button.css'
import './IconButton.css'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
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
   * (`width="1em"`). Both land on 1.25em. Pass `size` to opt out.
   */
  children?: ReactNode
  /**
   * Required, not optional. An icon-only control carries no text node, so
   * without this it is anonymous to VoiceOver — the most common accessibility
   * hole in a ported icon button. A type error costs less than an audit.
   */
  'aria-label': string
  /**
   * Defaults to `plain` rather than Button's `filled`: an icon button is nearly
   * always chrome — a nav bar, a toolbar, a card corner — where a filled square
   * would out-shout the content it sits beside.
   * @default 'plain'
   */
  variant?: ButtonVariant
  /** @default 'tint' */
  tone?: MayTone
  /** @default 'md' */
  size?: MaySize
  /** Circular instead of rounded-square, the way iOS draws close and more. */
  round?: boolean
  loading?: boolean
}

/**
 * Button with one dimension removed.
 *
 * Everything visual — variants, tones, press feel — comes from `.may-button`,
 * so a tone added to Button arrives here for free and the two can never drift
 * apart. IconButton.css only squares the geometry and restores the touch target
 * that the smaller sizes would otherwise lose.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    children,
    asChild = false,
    variant = 'plain',
    tone = 'tint',
    size = 'md',
    round = false,
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

  const inner = (glyph: ReactNode) =>
    loading ? (
      <span className="may-button__spinner" aria-hidden />
    ) : (
      <span className="may-icon-button__glyph" aria-hidden>
        {glyph}
      </span>
    )

  const presentation = {
    'data-slot': 'icon-button',
    'data-variant': variant,
    'data-tone': tone,
    'data-size': size,
    'data-round': round ? 'true' : undefined,
    className: cx('may-button', 'may-icon-button', 'may-pressable', 'may-hoverable', className),
  }

  if (asChild) {
    return renderAsChild(
      children,
      { ...rest, ...pressProps, ref, ...presentation, 'aria-busy': loading || undefined, 'aria-disabled': isDisabled || undefined },
      inner,
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
      {inner(children)}
    </button>
  )
})
