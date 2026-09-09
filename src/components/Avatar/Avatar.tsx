import type { HTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { cx } from '../../utils/cx'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials if it fails to load. */
  src?: string
  /** The person or entity's name — used for the alt text and the initials. */
  name?: string
  /** Override the derived initials. */
  initials?: string
  /** @default 'md' */
  size?: AvatarSize
  /** @default 'circle' */
  shape?: 'circle' | 'square'
  /** Custom fallback (e.g. an icon) shown when there is no image or name. */
  fallback?: ReactNode
}

/** Derive up to two initials from a display name. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/** A person or entity's image, with an initials fallback. */
export function Avatar({
  src,
  name,
  initials,
  size = 'md',
  shape = 'circle',
  fallback,
  className,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const text = initials ?? (name ? initialsFrom(name) : '')
  const showImage = src && !failed

  return (
    <span
      {...rest}
      className={cx('may-avatar', `may-avatar--${size}`, `may-avatar--${shape}`, className)}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : name}
    >
      {showImage ? (
        <img className="may-avatar__image" src={src} alt={name ?? ''} onError={() => setFailed(true)} />
      ) : text ? (
        <span className="may-avatar__initials" aria-hidden>
          {text}
        </span>
      ) : (
        (fallback ?? (
          <svg className="may-avatar__icon" viewBox="0 0 24 24" aria-hidden focusable="false">
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2.2-7 5v1h14v-1c0-2.8-3-5-7-5z"
              fill="currentColor"
            />
          </svg>
        ))
      )}
    </span>
  )
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Show at most this many avatars, then a "+N" counter. */
  max?: number
  /** @default 'md' */
  size?: AvatarSize
}

/** Overlapping avatars with an optional overflow counter. */
export function AvatarGroup({ children, max, size = 'md', className, ...rest }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children.flat() : [children]
  const visible = max ? items.slice(0, max) : items
  const overflow = max ? items.length - visible.length : 0

  return (
    <div {...rest} className={cx('may-avatar-group', className)}>
      {visible}
      {overflow > 0 && (
        <span className={cx('may-avatar', `may-avatar--${size}`, 'may-avatar--circle', 'may-avatar--overflow')}>
          <span className="may-avatar__initials">+{overflow}</span>
        </span>
      )}
    </div>
  )
}
