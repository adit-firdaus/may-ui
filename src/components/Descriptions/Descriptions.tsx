import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Children, createContext, isValidElement, useContext } from 'react'
import { cx } from '../../utils/cx'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import './Descriptions.css'

/**
 * Position of a row inside the grid, handed down so each row knows whether it
 * is on the top edge — the one thing CSS cannot work out for itself once the
 * rows wrap into columns, since `nth-child` cannot read a runtime count.
 */
const DescriptionRowContext = createContext<{ index: number; columns: number }>({
  index: 0,
  columns: 1,
})

export interface DescriptionsProps extends HTMLAttributes<HTMLDListElement> {
  children?: ReactNode
  /** Section header above the card, in the iOS grouped style. */
  header?: ReactNode
  /** Muted explanatory text below the card. */
  footer?: ReactNode
  /** `inset` is the grouped card; `plain` is full-bleed. @default 'inset' */
  variant?: 'inset' | 'plain'
  /**
   * `inline` is the Settings row — label left, value right. `stacked` puts the
   * label above the value, the way Contacts shows a phone number.
   * @default 'inline'
   */
  layout?: 'inline' | 'stacked'
  /**
   * Columns to split the pairs across ON DESKTOP ONLY. A phone is always one
   * column: two columns of key/value at 390px is unreadable, and the pairs
   * would be narrower than their own values.
   * @default 1
   */
  columns?: number
}

/**
 * Key/value pairs in the iOS grouped style.
 *
 * Renders a real `<dl>` of `<dt>`/`<dd>` pairs rather than a table or a stack
 * of divs, so a screen reader announces "Model, iPhone 15 Pro" as one term and
 * its definition instead of two unrelated strings.
 */
export function Descriptions({
  children,
  header,
  footer,
  variant = 'inset',
  layout = 'inline',
  columns = 1,
  className,
  style,
  ...rest
}: DescriptionsProps) {
  const isDesktop = useIsDesktop()
  const resolved = isDesktop ? Math.max(1, Math.floor(columns)) : 1

  // toArray drops nulls and booleans, so a conditionally rendered row cannot
  // silently consume an index and push the whole first-row calculation over.
  const rows = Children.toArray(children)

  return (
    <div className={cx('may-descriptions-group', className)}>
      {header && <div className="may-descriptions__section-header">{header}</div>}
      <dl
        {...rest}
        data-slot="descriptions"
        data-variant={variant}
        data-layout={layout}
        data-columns={resolved}
        className="may-descriptions"
        style={{ ...style, '--may-desc-columns': resolved } as CSSProperties}
      >
        {rows.map((row, index) => (
          // toArray has already given every row a stable key; reusing it means
          // reordering the pairs moves them rather than remounting them.
          <DescriptionRowContext.Provider
            key={isValidElement(row) ? (row.key ?? index) : index}
            value={{ index, columns: resolved }}
          >
            {row}
          </DescriptionRowContext.Provider>
        ))}
      </dl>
      {footer && <div className="may-descriptions__section-footer">{footer}</div>}
    </div>
  )
}

export interface DescriptionItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  /** The value. `children` works too, for values built from several elements. */
  value?: ReactNode
  children?: ReactNode
}

/** One key/value pair. */
export function DescriptionItem({
  label,
  value,
  children,
  className,
  ...rest
}: DescriptionItemProps) {
  const { index, columns } = useContext(DescriptionRowContext)
  // Every row draws a hairline above itself except the first of each column,
  // which would otherwise rule along the card's own top edge.
  const rowStart = index < columns

  return (
    <div
      {...rest}
      data-slot="description-item"
      data-row-start={rowStart ? 'true' : undefined}
      className={cx('may-desc__item', className)}
    >
      <dt className="may-desc__label">{label}</dt>
      <dd className="may-desc__value">{value ?? children}</dd>
    </div>
  )
}
