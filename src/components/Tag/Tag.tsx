import type { HTMLAttributes, ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize, MayTone } from '../../types'
import './Tag.css'

/** A chip is a hair larger than a badge and a hair smaller than a button. */
export type TagSize = Exclude<MaySize, 'xs'>

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  children?: ReactNode
  /** @default 'neutral' */
  tone?: MayTone
  /** @default 'md' */
  size?: TagSize
  /** Renders the trailing X. Without it the tag is a static chip. */
  onRemove?: () => void
  /**
   * Accessible name for the X. Defaults to `Remove <label>` when the label is
   * a plain string — "Remove" alone is useless in a list of eight chips.
   */
  removeLabel?: string
  leadingIcon?: ReactNode
}

/**
 * A removable chip — a Mail recipient token, a filter, a selected genre.
 *
 * Two details do most of the work. The chip springs in on mount, because a tag
 * almost always appears as the direct result of the user adding something and
 * that arrival should be visible. And the X carries an invisible 44px hit
 * target: the glyph is small by design, but the thing you tap is not.
 */
export function Tag({
  children,
  tone = 'neutral',
  size = 'md',
  onRemove,
  removeLabel,
  leadingIcon,
  className,
  ...rest
}: TagProps) {
  const { pressProps } = usePressFeedback(!onRemove)
  const label =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')

  return (
    <span
      {...rest}
      data-slot="tag"
      data-tone={tone}
      data-size={size}
      className={cx('may-tag', className)}
    >
      {leadingIcon && (
        <span className="may-tag__icon" aria-hidden>
          {leadingIcon}
        </span>
      )}
      {children != null && <span className="may-tag__label">{children}</span>}
      {onRemove && (
        <button
          {...pressProps}
          type="button"
          onClick={onRemove}
          aria-label={label}
          className="may-tag__remove may-pressable may-hoverable"
        >
          <IoClose aria-hidden focusable="false" />
        </button>
      )}
    </span>
  )
}
