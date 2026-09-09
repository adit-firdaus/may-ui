import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Card.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** `outline` draws a border, `raised` uses elevation instead. @default 'outline' */
  variant?: 'outline' | 'raised' | 'plain'
  /** Inner padding preset. @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Add hover/active affordances. Pair with `onClick` or a link. @default false */
  interactive?: boolean
}

/** A surface that groups related content. */
export function Card({
  children,
  variant = 'outline',
  padding = 'md',
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cx(
        'may-card',
        `may-card--${variant}`,
        `may-card--padding-${padding}`,
        interactive && 'may-card--interactive',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

/** Header row of a card — typically a title and an action. */
export function CardHeader({ children, className, ...rest }: CardSectionProps) {
  return (
    <div {...rest} className={cx('may-card__header', className)}>
      {children}
    </div>
  )
}

/** Card title. Renders an `<h3>`; override with `as` on a Heading if needed. */
export function CardTitle({ children, className, ...rest }: CardSectionProps) {
  return (
    <h3 {...rest} className={cx('may-card__title', className)}>
      {children}
    </h3>
  )
}

/** Muted supporting line under the card title. */
export function CardDescription({ children, className, ...rest }: CardSectionProps) {
  return (
    <p {...rest} className={cx('may-card__description', className)}>
      {children}
    </p>
  )
}

/** Main card content. */
export function CardBody({ children, className, ...rest }: CardSectionProps) {
  return (
    <div {...rest} className={cx('may-card__body', className)}>
      {children}
    </div>
  )
}

/** Footer row, separated by a rule — usually holds the card's actions. */
export function CardFooter({ children, className, ...rest }: CardSectionProps) {
  return (
    <div {...rest} className={cx('may-card__footer', className)}>
      {children}
    </div>
  )
}
