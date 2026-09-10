import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import type { MaySize } from '../../types'
import './EmptyState.css'

// `title` is a node here, not the DOM's tooltip string, so the native one goes.
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Large muted glyph — an SF-Symbol-style SVG, or any icon node. */
  glyph?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** A single `Button`, or a pair of them. */
  action?: ReactNode
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  /**
   * Heading level for the title. A card is rarely the top of the document
   * outline, so the default is h3 — but the level must follow the page.
   * @default 'h3'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}

/**
 * The state a screen is in before it has anything to show.
 *
 * Everything here is muted on purpose: an empty state is not an error, and
 * colouring it like one makes an ordinary first run feel like a failure. The
 * only saturated element is the action, if there is one.
 *
 * The three parts arrive staggered — glyph, then text, then action — which
 * reads as the screen composing itself rather than as one block appearing.
 */
export function EmptyState({
  glyph,
  title,
  description,
  action,
  size = 'md',
  as: Title = 'h3',
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      {...rest}
      data-slot="empty-state"
      data-size={size}
      className={cx('may-empty', className)}
    >
      {glyph && (
        <div className="may-empty__glyph" aria-hidden>
          {glyph}
        </div>
      )}
      <Title className="may-empty__title">{title}</Title>
      {description && <p className="may-empty__description">{description}</p>}
      {action && <div className="may-empty__action">{action}</div>}
    </div>
  )
}
