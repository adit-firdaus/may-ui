import type { HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import './Separator.css'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** @default 'horizontal' */
  orientation?: SeparatorOrientation
  /**
   * Centred caption with a rule running out to either side — the "or" divider.
   * Horizontal only; a vertical rule has nowhere to put it.
   */
  label?: ReactNode
}

/**
 * A hairline.
 *
 * One physical pixel, not one CSS pixel: `.may-hairline` in base.css drops to
 * 0.5px at 2dppx, because a 1px rule on a retina screen is twice as heavy as
 * iOS draws it and reads as a web page immediately.
 *
 * Rows inside a `List` draw their own hairline as a ::before, so it can be
 * inset under the label without touching the box model. This component is for
 * the standalone case — between two cards, or beside a toolbar button.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', label, className, ...rest },
  ref,
) {
  const labelled = label != null && orientation === 'horizontal'

  const shared = {
    ref,
    'data-slot': 'separator',
    'data-orientation': orientation,
    role: 'separator',
    // horizontal is role="separator"'s implicit orientation, so only the
    // exception is worth announcing.
    'aria-orientation': orientation === 'vertical' ? ('vertical' as const) : undefined,
  }

  if (!labelled) {
    return (
      <div
        {...rest}
        {...shared}
        className={cx('may-separator', 'may-hairline', className)}
      />
    )
  }

  return (
    <div
      {...rest}
      {...shared}
      // role="separator" takes its name from the author, never from content,
      // so a text label has to be repeated here to reach a screen reader.
      aria-label={typeof label === 'string' ? label : undefined}
      className={cx('may-separator', 'may-separator--labelled', className)}
    >
      <span className="may-separator__rule may-hairline" aria-hidden />
      <span className="may-separator__label">{label}</span>
      <span className="may-separator__rule may-hairline" aria-hidden />
    </div>
  )
})
