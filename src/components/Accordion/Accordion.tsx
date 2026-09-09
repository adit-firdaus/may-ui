import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import './Accordion.css'

interface AccordionContextValue {
  open: string[]
  toggle: (value: string) => void
  baseId: string
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

export interface AccordionProps {
  children?: ReactNode
  /** Allow several items open at once. @default false */
  multiple?: boolean
  /** Controlled list of open item values. */
  value?: string[]
  /** Uncontrolled initial open items. */
  defaultValue?: string[]
  /** Fires with the full list of open item values. */
  onValueChange?: (value: string[]) => void
  /** Draw separators between items. @default true */
  bordered?: boolean
  className?: string
}

/** A vertical list of expandable sections. */
export function Accordion({
  children,
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  bordered = true,
  className,
}: AccordionProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue)
  const baseId = useAutoId()
  const open = value ?? internal

  const ctx = useMemo<AccordionContextValue>(
    () => ({
      open,
      baseId,
      toggle: (item) => {
        const isOpen = open.includes(item)
        const next = isOpen
          ? open.filter((entry) => entry !== item)
          : multiple
            ? [...open, item]
            : [item]
        if (value === undefined) setInternal(next)
        onValueChange?.(next)
      },
    }),
    [open, value, multiple, onValueChange, baseId],
  )

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cx('may-accordion', bordered && 'may-accordion--bordered', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps {
  /** Panel content. */
  children?: ReactNode
  /** Identifies this item. */
  value: string
  /** The always-visible trigger label. */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  disabled?: boolean
  className?: string
}

/** One expandable section. */
export function AccordionItem({
  children,
  value,
  title,
  description,
  disabled = false,
  className,
}: AccordionItemProps) {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('<AccordionItem> must be used inside <Accordion>')

  const isOpen = ctx.open.includes(value)
  const triggerId = `${ctx.baseId}-trigger-${value}`
  const panelId = `${ctx.baseId}-panel-${value}`

  return (
    <div className={cx('may-accordion__item', isOpen && 'may-accordion__item--open', className)}>
      <h3 className="may-accordion__heading">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => ctx.toggle(value)}
          className="may-accordion__trigger"
        >
          <span className="may-accordion__titles">
            <span className="may-accordion__title">{title}</span>
            {description && <span className="may-accordion__description">{description}</span>}
          </span>
          <svg className="may-accordion__chevron" viewBox="0 0 16 16" aria-hidden focusable="false">
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="may-accordion__panel"
      >
        <div className="may-accordion__content">{children}</div>
      </div>
    </div>
  )
}
