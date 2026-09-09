import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Box.css'

/** Named steps on the 4px spacing scale. */
export type MaySpace = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
export type MayRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type MayShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type MaySurface = 'none' | 'base' | 'raised' | 'sunken' | 'subtle'

export interface BoxProps {
  children?: ReactNode
  /** Element to render. @default 'div' */
  as?: ElementType
  /** Padding on all sides, in spacing steps. */
  padding?: MaySpace
  /** Horizontal padding; overrides `padding`. */
  paddingX?: MaySpace
  /** Vertical padding; overrides `padding`. */
  paddingY?: MaySpace
  /** Background role drawn from the semantic surface tokens. @default 'none' */
  surface?: MaySurface
  /** Corner radius. @default 'none' */
  radius?: MayRadius
  /** Elevation. @default 'none' */
  shadow?: MayShadow
  /** Draw a 1px border in the default border token. @default false */
  bordered?: boolean
  /** Stretch to the full width of the parent. @default false */
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

const surfaceVar: Record<MaySurface, string | undefined> = {
  none: undefined,
  base: 'var(--may-color-surface)',
  raised: 'var(--may-color-surface-raised)',
  sunken: 'var(--may-color-surface-sunken)',
  subtle: 'var(--may-color-bg-subtle)',
}

const space = (step?: MaySpace) =>
  step === undefined ? undefined : `var(--may-space-${step})`

/**
 * The system's styling escape hatch: a single element with token-bound
 * padding, surface, radius and elevation. Use it for layout glue instead of
 * ad-hoc `style` objects or one-off CSS.
 */
export function Box({
  children,
  as: Tag = 'div',
  padding,
  paddingX,
  paddingY,
  surface = 'none',
  radius = 'none',
  shadow = 'none',
  bordered = false,
  fullWidth = false,
  className,
  style,
}: BoxProps) {
  return (
    <Tag
      className={cx('may-box', fullWidth && 'may-box--full', className)}
      style={
        {
          padding: space(padding),
          paddingInline: space(paddingX),
          paddingBlock: space(paddingY),
          background: surfaceVar[surface],
          borderRadius: radius === 'none' ? undefined : `var(--may-radius-${radius})`,
          boxShadow: shadow === 'none' ? undefined : `var(--may-shadow-${shadow})`,
          border: bordered ? '1px solid var(--may-color-border)' : undefined,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
