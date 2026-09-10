import type { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Box.css'

/**
 * A step on the 4px spacing scale in tokens.css. The gaps in the sequence are
 * deliberate — the scale stops being linear once the values get large enough
 * that a 4px difference is invisible.
 */
export type MaySpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24

/**
 * Which layer the box sits on.
 *
 * Surfaces separate by VALUE, never by a stroke: `base` over `grouped` is the
 * exact contrast iOS uses between a card and the page behind it, and `nested`
 * is the inset field inside that card. There is no `bordered` — a stroke is
 * the thing this system never draws.
 */
export type BoxSurface = 'none' | 'base' | 'nested' | 'grouped'

export type BoxRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'card' | 'sheet' | 'full'

export type BoxShadow = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface BoxOwnProps {
  children?: ReactNode
  /** Padding on all four sides. */
  padding?: MaySpaceStep
  /** Inline padding. Wins over `padding`. */
  paddingX?: MaySpaceStep
  /** Block padding. Wins over `padding`. */
  paddingY?: MaySpaceStep
  /** @default 'none' */
  surface?: BoxSurface
  /** @default 'none' */
  radius?: BoxRadius
  /** @default 'none' */
  shadow?: BoxShadow
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

export type BoxProps<E extends ElementType = 'div'> = BoxOwnProps & {
  /** Element or component to render as. @default 'div' */
  as?: E
} & Omit<ComponentPropsWithoutRef<E>, keyof BoxOwnProps | 'as'>

/** Spacing steps resolve to tokens, never to raw lengths. */
const space = (step: MaySpaceStep) => `var(--may-space-${step})`

/**
 * The layout surface everything else is built on.
 *
 * Padding is handed to CSS as custom properties rather than as one rule per
 * step, because thirteen steps across three props is thirty-nine rules of
 * stylesheet for something a single variable expresses. The defaults live in
 * Box.css, so an omitted prop still resolves through the token layer.
 */
export function Box<E extends ElementType = 'div'>({
  as,
  children,
  padding,
  paddingX,
  paddingY,
  surface = 'none',
  radius = 'none',
  shadow = 'none',
  fullWidth = false,
  className,
  style,
  ...rest
}: BoxProps<E>) {
  // A dynamic tag can only be typed loosely here; BoxProps is what keeps the
  // call site honest about which attributes the chosen element accepts.
  const Component = (as ?? 'div') as ElementType

  const block = paddingY ?? padding
  const inline = paddingX ?? padding

  const vars: Record<string, string> = {}
  if (block !== undefined) {
    vars['--may-box-pt'] = space(block)
    vars['--may-box-pb'] = space(block)
  }
  if (inline !== undefined) {
    vars['--may-box-pl'] = space(inline)
    vars['--may-box-pr'] = space(inline)
  }

  return (
    <Component
      {...rest}
      data-slot="box"
      data-surface={surface}
      data-radius={radius}
      data-shadow={shadow}
      className={cx('may-box', fullWidth && 'may-box--full', className)}
      // Consumer styles land last so an explicit override always wins.
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </Component>
  )
}
