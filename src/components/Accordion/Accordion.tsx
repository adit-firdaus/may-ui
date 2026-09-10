import type { HTMLAttributes, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { Collapsible } from '../Collapsible/Collapsible'
// The rows are Collapsible's markup wearing this component's classes, so its
// stylesheet must be a value import — a type-only one is erased at compile and
// Storybook then code-splits the rules away, leaving the panel unstyled.
import '../Collapsible/Collapsible.css'
import './Accordion.css'

export type AccordionType = 'single' | 'multiple'

interface AccordionContextValue {
  openValues: string[]
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: ReactNode
  /**
   * `single` closes the open item when another opens — the FAQ behaviour.
   * @default 'single'
   */
  type?: AccordionType
  /**
   * Controlled open items. Always an array, in both modes: switching `type`
   * would otherwise change the type of `value` and break every call site.
   */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** In `single` mode, whether the open item can be closed by tapping it. @default true */
  collapsible?: boolean
  /** `inset` is the grouped card; `plain` is full-bleed. @default 'inset' */
  variant?: 'inset' | 'plain'
  /** Section header above the card, in the iOS grouped style. */
  header?: ReactNode
  /** Muted explanatory text below the card. */
  footer?: ReactNode
}

/**
 * A grouped list of disclosures.
 *
 * Items share one rounded card with hairlines between them, exactly as `List`
 * builds a Settings group — which is what makes six questions read as one
 * panel instead of six floating cards. Each row is a `Collapsible`; this
 * component only owns which of them are open.
 */
export function Accordion({
  children,
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  variant = 'inset',
  header,
  footer,
  className,
  ...rest
}: AccordionProps) {
  // A single-mode accordion handed several default values would open all of
  // them and then close them one at a time as the user tapped — take the first.
  const [internal, setInternal] = useState<string[]>(() =>
    type === 'single' ? (defaultValue ?? []).slice(0, 1) : (defaultValue ?? []),
  )
  const openValues = value ?? internal

  const toggle = useCallback(
    (item: string) => {
      const isOpen = openValues.includes(item)
      const next =
        type === 'single'
          ? isOpen
            ? collapsible
              ? []
              : openValues
            : [item]
          : isOpen
            ? openValues.filter((v) => v !== item)
            : [...openValues, item]

      if (next === openValues) return
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [collapsible, onValueChange, openValues, type, value],
  )

  const context = useMemo<AccordionContextValue>(
    () => ({ openValues, toggle }),
    [openValues, toggle],
  )

  return (
    <div className={cx('may-accordion-group', className)}>
      {header && <div className="may-accordion__section-header">{header}</div>}
      <AccordionContext.Provider value={context}>
        <div {...rest} data-slot="accordion" data-variant={variant} className="may-accordion">
          {children}
        </div>
      </AccordionContext.Provider>
      {footer && <div className="may-accordion__section-footer">{footer}</div>}
    </div>
  )
}

export interface AccordionItemProps {
  /** Identity of this item within the accordion. Must be unique. */
  value: string
  /** Primary line of the row. */
  title: ReactNode
  /** Secondary line under the title. */
  subtitle?: ReactNode
  /** Leading element — an `IconTile`, an `Avatar`, a glyph. */
  leading?: ReactNode
  /** Trailing value shown muted before the chevron, as `ListRow` does. */
  detail?: ReactNode
  children?: ReactNode
  disabled?: boolean
  className?: string
}

/** One row plus its panel. Must be rendered inside an `Accordion`. */
export function AccordionItem({
  value,
  title,
  subtitle,
  leading,
  detail,
  children,
  disabled = false,
  className,
}: AccordionItemProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('<AccordionItem> must be rendered inside <Accordion>')

  const open = context.openValues.includes(value)

  return (
    <div
      data-slot="accordion-item"
      data-state={open ? 'open' : 'closed'}
      className={cx('may-accordion__item', className)}
    >
      <Collapsible
        open={open}
        onOpenChange={() => context.toggle(value)}
        disabled={disabled}
        triggerClassName="may-accordion__trigger"
        panelClassName="may-accordion__panel"
        trigger={
          <span className="may-accordion__row">
            {leading && <span className="may-accordion__leading">{leading}</span>}
            <span className="may-accordion__text">
              <span className="may-accordion__title">{title}</span>
              {subtitle && <span className="may-accordion__subtitle">{subtitle}</span>}
            </span>
            {detail && <span className="may-accordion__detail">{detail}</span>}
          </span>
        }
      >
        {children}
      </Collapsible>
    </div>
  )
}
