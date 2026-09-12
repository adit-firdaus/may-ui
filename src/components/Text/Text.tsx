import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MayTextStyle } from '../../types'

/**
 * Tone is a role, not a colour. `secondary` and `tertiary` are Apple's label
 * ramp — the greys supporting copy is drawn in, which already carry the right
 * contrast in both themes. `tint` is brand-as-TEXT (a link), never
 * brand-as-fill; see the note at the top of tokens.css.
 */
export type TextTone = 'default' | 'secondary' | 'tertiary' | 'tint' | 'danger' | 'success'

/** The four weights SF actually uses in the UI range. */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export type TextAlign = 'start' | 'center' | 'end'

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  children?: ReactNode
  /** One of Apple's 11 named text styles. @default 'body' */
  variant?: MayTextStyle
  /** @default 'default' */
  tone?: TextTone
  /** Overrides the weight the variant carries. Size, leading and tracking stay. */
  weight?: TextWeight
  align?: TextAlign
  /** Truncate to this many lines with an ellipsis. */
  clamp?: number
  /** Render in the monospace face, with tabular figures. */
  mono?: boolean
  /**
   * Element to render. `p` by default because base.css keeps `p` selectable
   * while control chrome is not — body copy you cannot select is the tell in
   * the other direction. Use `span` for inline runs inside a row or a button.
   * @default 'p'
   */
  as?: ElementType
}

/**
 * Every piece of non-heading copy in the system.
 *
 * The variant is the whole point: it sets size, leading, tracking AND weight
 * together, from the four tokens that belong to one named style. In iOS those
 * four move as a unit — `headline` is the same 17px as `body` and differs only
 * in weight and tracking — so a component that exposes size on its own can
 * only ever approximate the scale.
 *
 * Picking `large-title` here does not make the element a heading. Use
 * `Heading` when the text is document structure; this one stays a paragraph.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    variant = 'body',
    tone = 'default',
    weight,
    align,
    clamp,
    mono = false,
    as,
    className,
    style,
    ...rest
  },
  ref,
) {
  const Component = (as ?? 'p') as ElementType

  return (
    <Component
      {...rest}
      ref={ref}
      data-slot="text"
      data-variant={variant}
      data-tone={tone}
      data-weight={weight}
      data-align={align}
      data-mono={mono ? 'true' : undefined}
      data-clamp={clamp != null ? 'true' : undefined}
      className={cx('may-text', className)}
      // The line count has to reach CSS as a value, not a class — any integer
      // is legal. The CSS declares a default for it so the token gate still
      // sees the variable defined.
      style={clamp != null ? ({ ...style, '--may-txt-clamp': clamp } as CSSProperties) : style}
    >
      {children}
    </Component>
  )
})
