import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import type { MaySize } from '../../types'
import './Avatar.css'

/** xs–xl. `md` is exactly one touch target; the rest are proportions of it. */
export type AvatarSize = MaySize | 'xl'

/** `square` uses the app-icon squircle radius, not a rounded rectangle. */
export type AvatarShape = 'circle' | 'square'

/**
 * Fallback gradients. Yellow and red are deliberately absent: white initials
 * on yellow fail contrast, and a red avatar reads as an error state rather
 * than as a person.
 */
const HUES = ['blue', 'indigo', 'purple', 'pink', 'teal', 'green', 'orange', 'gray'] as const
export type AvatarHue = (typeof HUES)[number]

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Drives both the initials and — deterministically — the fallback colour. */
  name?: string
  src?: string
  /** Defaults to `name`. */
  alt?: string
  /** @default 'md' */
  size?: AvatarSize
  /** @default 'circle' */
  shape?: AvatarShape
  /** Shown when there is neither an image nor a name. */
  fallback?: ReactNode
  /** Pin the fallback colour instead of deriving it from the name. */
  hue?: AvatarHue
}

/**
 * Two letters, the way Contacts derives them: first and last word. A mononym
 * ("Prince", "Safari") has no last word to borrow from, so it gives up its
 * first two characters instead of leaving a lonely single letter.
 */
export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Stable hash → hue. The same person is the same colour on every screen and
 * across reloads, which is the only reason a derived colour is useful at all;
 * a random one would just be noise.
 *
 * FNV-1a rather than the usual `hash * 31 + c`: that hash keeps almost no
 * entropy in its low bits, and reducing it against a power-of-two bucket count
 * reads only those bits — a room full of people comes out three colours.
 */
function hueFor(seed: string): AvatarHue {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return HUES[hash % HUES.length]
}

/**
 * A person.
 *
 * The initials fallback is a real gradient tile rather than a grey circle,
 * because a Messages thread or an AirDrop sheet full of grey circles reads as
 * missing data. A broken `src` falls back to the same treatment: an avatar
 * that 404s must not leave a hole in the row.
 */
export function Avatar({
  name,
  src,
  alt,
  size = 'md',
  shape = 'circle',
  fallback,
  hue,
  className,
  'aria-label': ariaLabel,
  ...rest
}: AvatarProps) {
  const [broken, setBroken] = useState(false)

  // A new src earns a fresh attempt — otherwise one 404 poisons the slot for
  // every subsequent person rendered through the same element.
  useEffect(() => setBroken(false), [src])

  const showImage = Boolean(src) && !broken
  const initials = name ? initialsFrom(name) : ''
  // aria-label is pulled out of the rest props rather than spread through it:
  // an anonymous avatar is named by the caller, and the name has to land on
  // whichever of the two elements — root or img — actually carries it.
  const label = alt ?? name ?? ariaLabel

  return (
    <span
      {...rest}
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      data-hue={!showImage && initials ? (hue ?? hueFor(name ?? '')) : undefined}
      role={!showImage && label ? 'img' : undefined}
      aria-label={!showImage && label ? label : undefined}
      className={cx('may-avatar', className)}
    >
      {showImage ? (
        <img
          className="may-avatar__image"
          src={src}
          alt={label ?? ''}
          draggable={false}
          onError={() => setBroken(true)}
        />
      ) : initials ? (
        <span className="may-avatar__initials" aria-hidden>
          {initials}
        </span>
      ) : (
        <span className="may-avatar__glyph" aria-hidden>
          {fallback ?? <PersonGlyph />}
        </span>
      )}
    </span>
  )
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Avatars past this collapse into a +N chip. @default 4 */
  max?: number
  /** Applied to every child that has not set its own. @default 'md' */
  size?: AvatarSize
}

/**
 * A stack of overlapping avatars.
 *
 * The gap between them is *punched out*, not drawn: each avatar wears a mask
 * with a hole where its neighbour sits. A ring would be a stroke, and this
 * system does not separate anything with a stroke — the mask gets the same
 * result out of the layer underneath, and it stays correct on any background.
 */
export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter((child): child is ReactElement<AvatarProps> =>
    isValidElement(child),
  )
  const shown = items.slice(0, max)
  const overflow = items.length - shown.length

  return (
    <div
      {...rest}
      data-slot="avatar-group"
      data-size={size}
      className={cx('may-avatar-group', className)}
    >
      {shown.map((child, index) =>
        cloneElement(child, { key: index, size: child.props.size ?? size }),
      )}
      {overflow > 0 && (
        <span
          data-slot="avatar-more"
          data-size={size}
          data-shape="circle"
          className="may-avatar may-avatar--more"
          aria-label={`${overflow} more`}
          role="img"
        >
          {`+${overflow}`}
        </span>
      )}
    </div>
  )
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false">
      <circle cx="16" cy="12" r="5.4" fill="currentColor" />
      <path d="M5.6 29c0-6 4.7-9.4 10.4-9.4S26.4 23 26.4 29z" fill="currentColor" />
    </svg>
  )
}
