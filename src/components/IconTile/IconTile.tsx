import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './IconTile.css'

/** The eleven app-icon gradients defined in the token layer. */
export type IconTileGradient =
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'teal'
  | 'indigo'
  | 'gray'
  | 'spectrum'

/**
 * `sm` is 29pt — the size iOS Settings draws a row icon at, and the size the
 * List hairline indent is measured against. `lg` is the 60pt home-screen icon.
 */
export type IconTileSize = 'sm' | 'md' | 'lg'

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  /** The glyph. An `<svg>` scales with the tile automatically. */
  children?: ReactNode
  /** @default 'blue' */
  gradient?: IconTileGradient
  /** @default 'sm' */
  size?: IconTileSize
  /**
   * Set only when the tile carries meaning on its own. Beside a "Wi-Fi" label
   * it does not — it is decoration, and a screen reader announcing it twice is
   * worse than silence — so the default is `aria-hidden`.
   */
  label?: string
}

/**
 * The iOS app-icon tile: a gradient squircle with a white glyph, used as the
 * leading element of a List row and as the icon in a settings-style grid.
 *
 * It casts no shadow, on purpose. An app icon sits *in* the surface rather
 * than floating above it; a drop shadow under one is the single clearest tell
 * that a UI was drawn on the web. The gradient alone gives it its dimension.
 */
export function IconTile({
  children,
  gradient = 'blue',
  size = 'sm',
  label,
  className,
  'aria-label': ariaLabel,
  ...rest
}: IconTileProps) {
  // A caller who wrote aria-label directly meant the same thing as `label`;
  // spreading it through rest would leave the tile both named and hidden.
  const name = label ?? ariaLabel

  return (
    <span
      {...rest}
      data-slot="icon-tile"
      data-gradient={gradient}
      data-size={size}
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      className={cx('may-icon-tile', className)}
    >
      {children}
    </span>
  )
}
