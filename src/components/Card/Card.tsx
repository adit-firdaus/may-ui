import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import './Card.css'

/**
 * `elevated` floats above the page and is the only variant that casts a
 * shadow. `grouped` is the iOS Settings card — the same surface, separated
 * from the page by VALUE alone. `nested` is the darker fill a card takes when
 * it sits inside another card. `plain` is structure without a surface.
 *
 * There is no `outlined` variant: nothing in this system is separated by a
 * stroke, and a card is exactly where that temptation is strongest.
 */
export type CardVariant = 'elevated' | 'grouped' | 'nested' | 'plain'

/** Padding rung. `none` lets a `List` or an image sit flush to the corners. */
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  children?: ReactNode
  /** @default 'elevated' */
  variant?: CardVariant
  /** @default 'md' */
  padding?: CardPadding
  /**
   * Makes the whole card activatable: press feedback, a hover lift, and a real
   * `<button>` element. Implied by `onClick`.
   */
  interactive?: boolean
  onClick?: () => void
  disabled?: boolean
}

/**
 * A surface.
 *
 * The padding prop sets `--may-card-pad` rather than padding the root
 * directly, so `CardHeader` / `CardBody` / `CardFooter` inherit one rhythm and
 * a full-bleed child (a `List`, an image) can cancel it with `padding="none"`
 * without every section needing its own override.
 */
export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  interactive,
  onClick,
  disabled = false,
  className,
  ...rest
}: CardProps) {
  const activatable = Boolean(interactive ?? onClick)
  const { pressProps } = usePressFeedback(disabled || !activatable)

  const shared = {
    'data-slot': 'card',
    'data-variant': variant,
    'data-padding': padding,
    className: cx(
      'may-card',
      activatable && 'may-pressable',
      activatable && 'may-hoverable',
      className,
    ),
  }

  // A div with onClick is invisible to keyboard and switch-access users, so an
  // activatable card is a real button — never a listener bolted to a surface.
  if (!activatable) {
    return (
      <div {...rest} {...shared}>
        {children}
      </div>
    )
  }

  return (
    <button
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
      {...shared}
      {...pressProps}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Trailing element — a `Badge`, an overflow button, a chevron. */
  accessory?: ReactNode
}

/** Title block. Sits inside the card's own padding, so it adds none of its own. */
export function CardHeader({ children, accessory, className, ...rest }: CardHeaderProps) {
  return (
    <div {...rest} data-slot="card-header" className={cx('may-card__header', className)}>
      <div className="may-card__header-text">{children}</div>
      {accessory && <div className="may-card__header-accessory">{accessory}</div>}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level. A card is rarely the top of the document outline, so the
   * default is h3 — but the level must follow the page, not the component.
   * @default 'h3'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

export function CardTitle({ as: Tag = 'h3', className, ...rest }: CardTitleProps) {
  return <Tag {...rest} data-slot="card-title" className={cx('may-card__title', className)} />
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...rest }: CardDescriptionProps) {
  return (
    <p {...rest} data-slot="card-description" className={cx('may-card__description', className)} />
  )
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>

export function CardBody({ className, ...rest }: CardBodyProps) {
  return <div {...rest} data-slot="card-body" className={cx('may-card__body', className)} />
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>

/** Actions. Pushed to the bottom of a stretched card, trailing-aligned. */
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div {...rest} data-slot="card-footer" className={cx('may-card__footer', className)} />
}
