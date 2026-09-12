import type { CSSProperties, HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MaySpaceStep } from '../Box/Box'

export type StackDirection = 'row' | 'column'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** @default 'column' */
  direction?: StackDirection
  /** Gap as a step on the 4px scale. @default 0 */
  gap?: MaySpaceStep
  /** @default 'stretch' */
  align?: StackAlign
  /** @default 'start' */
  justify?: StackJustify
  wrap?: boolean
  fullWidth?: boolean
}

const space = (step: MaySpaceStep) => `var(--may-space-${step})`

/**
 * One-axis flex layout.
 *
 * `column` is the default because that is what a screen is: iOS composes
 * almost everything vertically, and a row is the exception you ask for.
 * Alignment is expressed in the short vocabulary (`start`, `between`) rather
 * than the CSS keywords, so `start` means the same thing on both axes.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 0,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    fullWidth = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      data-slot="stack"
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      className={cx(
        'may-stack',
        wrap && 'may-stack--wrap',
        fullWidth && 'may-stack--full',
        className,
      )}
      style={{ '--may-stack-gap': space(gap), ...style } as CSSProperties}
    >
      {children}
    </div>
  )
})
