import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Table.css'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children?: ReactNode
  /** @default 'md' */
  size?: 'sm' | 'md'
  /** Tint alternate rows. @default false */
  striped?: boolean
  /** Highlight rows on hover. @default false */
  hoverable?: boolean
  /** Keep the header visible while the container scrolls. @default false */
  stickyHeader?: boolean
  /** Class name for the scroll container that wraps the table. */
  containerClassName?: string
}

/** A data table. Always wrapped in a horizontally scrollable container. */
export function Table({
  children,
  size = 'md',
  striped = false,
  hoverable = false,
  stickyHeader = false,
  className,
  containerClassName,
  ...rest
}: TableProps) {
  return (
    <div className={cx('may-table-container', containerClassName)}>
      <table
        {...rest}
        className={cx(
          'may-table',
          `may-table--${size}`,
          striped && 'may-table--striped',
          hoverable && 'may-table--hoverable',
          stickyHeader && 'may-table--sticky',
          className,
        )}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...rest} className={cx('may-table__head', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody {...rest} className={cx('may-table__body', className)}>
      {children}
    </tbody>
  )
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Mark the row as selected. @default false */
  selected?: boolean
}

export function TableRow({ children, selected = false, className, ...rest }: TableRowProps) {
  return (
    <tr
      {...rest}
      aria-selected={selected || undefined}
      className={cx('may-table__row', selected && 'may-table__row--selected', className)}
    >
      {children}
    </tr>
  )
}

export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** @default 'start' */
  align?: 'start' | 'center' | 'end'
  /** Render digits in a tabular figure, right-aligned. @default false */
  numeric?: boolean
}

export function TableCell({ children, align = 'start', numeric = false, className, ...rest }: TableCellProps) {
  return (
    <td
      {...rest}
      className={cx(
        'may-table__cell',
        `may-table__cell--${numeric ? 'end' : align}`,
        numeric && 'may-table__cell--numeric',
        className,
      )}
    >
      {children}
    </td>
  )
}

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end'
  numeric?: boolean
}

export function TableHeaderCell({
  children,
  align = 'start',
  numeric = false,
  className,
  scope = 'col',
  ...rest
}: TableHeaderCellProps) {
  return (
    <th
      {...rest}
      scope={scope}
      className={cx(
        'may-table__header-cell',
        `may-table__cell--${numeric ? 'end' : align}`,
        className,
      )}
    >
      {children}
    </th>
  )
}
