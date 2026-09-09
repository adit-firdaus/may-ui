import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Text.css'

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TextTone = 'default' | 'muted' | 'subtle' | 'brand' | 'success' | 'warning' | 'danger' | 'inverted'

export interface TextProps {
  children?: ReactNode
  /** @default 'p' */
  as?: ElementType
  /** @default 'md' */
  size?: TextSize
  /** @default 'default' */
  tone?: TextTone
  /** @default 'normal' */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  /** Truncate to this many lines with an ellipsis. */
  clamp?: number
  /** Render in the monospace token. @default false */
  mono?: boolean
  className?: string
  style?: CSSProperties
}

/** Body copy, bound to the type and colour tokens. */
export function Text({
  children,
  as: Tag = 'p',
  size = 'md',
  tone = 'default',
  weight = 'normal',
  clamp,
  mono = false,
  className,
  style,
}: TextProps) {
  return (
    <Tag
      className={cx(
        'may-text',
        `may-text--${size}`,
        `may-text--tone-${tone}`,
        `may-text--weight-${weight}`,
        mono && 'may-text--mono',
        clamp ? 'may-text--clamp' : undefined,
        className,
      )}
      style={clamp ? ({ WebkitLineClamp: clamp, ...style } as CSSProperties) : style}
    >
      {children}
    </Tag>
  )
}
