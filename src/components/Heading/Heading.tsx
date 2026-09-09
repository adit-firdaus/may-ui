import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Heading.css'

export interface HeadingProps {
  children?: ReactNode
  /** Heading rank. Pick it for document structure, not for size. @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Visual size, independent of `level`. Defaults to match the level. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** @default 'semibold' */
  weight?: 'medium' | 'semibold' | 'bold'
  className?: string
  style?: CSSProperties
}

const sizeForLevel = { 1: '2xl', 2: 'xl', 3: 'lg', 4: 'md', 5: 'sm', 6: 'sm' } as const

/** Section headings. Choose `level` for structure and `size` for looks. */
export function Heading({
  children,
  level = 2,
  size,
  weight = 'semibold',
  className,
  style,
}: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag
      className={cx(
        'may-heading',
        `may-heading--${size ?? sizeForLevel[level]}`,
        `may-heading--weight-${weight}`,
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  )
}
