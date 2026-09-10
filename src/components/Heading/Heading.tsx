import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MayTextStyle } from '../../types'
import type { TextAlign, TextTone, TextWeight } from '../Text/Text'
// Value import, not a type-only one: Heading renders with Text's `.may-text`
// classes, and a type-only import is erased at compile time — Storybook then
// code-splits the scale away and the heading renders unstyled.
import '../Text/Text.css'
import './Heading.css'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
  children?: ReactNode
  /** Heading rank. Pick it for document structure, never for size. @default 2 */
  level?: HeadingLevel
  /** Visual size, independent of `level`. Defaults to the rank's own style. */
  size?: MayTextStyle
  /** @default 'default' */
  tone?: TextTone
  /** Overrides the weight the style carries; size and tracking stay. */
  weight?: TextWeight
  align?: TextAlign
  /** Truncate to this many lines with an ellipsis. */
  clamp?: number
}

/**
 * The default style for each rank.
 *
 * Ranks 1-4 walk down the display end of the scale, then 5 and 6 drop into the
 * UI range — `headline` and `subheadline` are what iOS uses for a group title
 * inside a screen, and setting them any larger makes a nested heading shout.
 */
const SIZE_FOR_LEVEL: Record<HeadingLevel, MayTextStyle> = {
  1: 'large-title',
  2: 'title-1',
  3: 'title-2',
  4: 'title-3',
  5: 'headline',
  6: 'subheadline',
}

/**
 * A document heading.
 *
 * Rank and size are separate props on purpose. A screen often needs an `h2`
 * that looks small, or an `h3` that opens a section at display size, and a
 * component that ties the two together forces a choice between correct
 * outline order and correct visual weight — so pages end up with the outline
 * wrong, because that is the half nobody sees.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { children, level = 2, size, tone = 'default', weight, align, clamp, className, style, ...rest },
  ref,
) {
  const Tag = `h${level}` as ElementType
  const variant = size ?? SIZE_FOR_LEVEL[level]

  return (
    <Tag
      {...rest}
      ref={ref}
      data-slot="heading"
      data-level={level}
      data-variant={variant}
      data-tone={tone}
      data-weight={weight}
      data-align={align}
      data-clamp={clamp != null ? 'true' : undefined}
      className={cx('may-text', 'may-heading', className)}
      style={clamp != null ? ({ ...style, '--may-txt-clamp': clamp } as CSSProperties) : style}
    >
      {children}
    </Tag>
  )
})
