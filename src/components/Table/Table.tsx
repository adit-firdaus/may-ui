import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { Fragment, isValidElement } from 'react'
import { IoCheckmark } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize } from '../../types'
import { List, ListRow } from '../List/List'
// The collapsed shape IS List's markup, so List's stylesheet has to arrive as a
// value import: a type-only import is erased at compile time and Storybook then
// code-splits those rules away, rendering the phone layout unstyled.
import '../List/List.css'
import './Table.css'

export interface TableColumn<T> {
  /** Column identity, and the property read off the record when there is no `render`. */
  key: string
  header: ReactNode
  /** Overrides the alignment that `numeric` implies. */
  align?: 'start' | 'center' | 'end'
  /** End-aligns the column and switches on tabular figures, so digits stack. */
  numeric?: boolean
  /** Applied through a `<col>`, so it survives table layout. A number is read as px. */
  width?: number | string
  render?: (row: T, index: number) => ReactNode
  /**
   * Marks the column that becomes the row's TITLE once the table collapses on a
   * phone. Defaults to the first column, which is nearly always the identifier.
   */
  primary?: boolean
}

/** Either a property name on the record, or a function deriving the key. */
export type TableRowKey<T> = (keyof T & string) | ((row: T, index: number) => string | number)

export interface TableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: TableColumn<T>[]
  data: T[]
  /** Identity of a record. Stable keys are what let rows move rather than remount. */
  rowKey: TableRowKey<T>
  /** Keys of the selected records. An array or a Set — both are read the same way. */
  selectedKeys?: readonly string[] | ReadonlySet<string>
  onRowClick?: (row: T, index: number) => void
  /**
   * Desktop row height. The collapsed shape ignores it — a row you tap with a
   * thumb is always the full 44px target, whatever density the table asked for.
   * @default 'md'
   */
  size?: Exclude<MaySize, 'xs'>
  /** Pins the header row. Needs `maxHeight` to be meaningful — see the CSS. */
  stickyHeader?: boolean
  /** Alternating row wash. Off by default; hairlines already group the rows. */
  zebra?: boolean
  /** Shown in place of the rows when `data` is empty. */
  emptyState?: ReactNode
  /** Section title above the card, in the iOS grouped style. Labels the table. */
  caption?: ReactNode
  /** Bounds the region and scrolls it. A number is read as px. */
  maxHeight?: number | string
}

const NO_SELECTION: ReadonlySet<string> = new Set()

/**
 * Rows past this index all share the last stagger step. Ten rows is long enough
 * to read as a cascade; staggering row two hundred would just make it late.
 */
const STAGGER_CAP = 10

function resolveKey<T>(rowKey: TableRowKey<T>, row: T, index: number): string {
  if (typeof rowKey === 'function') return String(rowKey(row, index))
  const raw = (row as Record<string, unknown>)[rowKey]
  return raw == null ? String(index) : String(raw)
}

/**
 * A cell's content. Without a `render` the raw property is used, but only when
 * it is something React can actually paint — a Date or a nested object would
 * otherwise reach the DOM as "[object Object]", which is worse than blank and
 * harder to notice. Non-primitives are the case `render` exists for.
 */
function cellContent<T>(column: TableColumn<T>, row: T, index: number): ReactNode {
  if (column.render) return column.render(row, index)
  const raw = (row as Record<string, unknown>)[column.key]
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return isValidElement(raw) ? raw : null
}

/** `numeric` implies end alignment; resolved here so header and body agree. */
function alignOf<T>(column: TableColumn<T>): 'start' | 'center' | 'end' {
  return column.align ?? (column.numeric ? 'end' : 'start')
}

interface TableRowProps<T> {
  row: T
  index: number
  columns: TableColumn<T>[]
  primaryIndex: number
  selected: boolean
  zebra: boolean
  onRowClick?: (row: T, index: number) => void
}

/**
 * One `<tr>`.
 *
 * Its own component because press feedback is a hook, and a hook cannot be
 * called inside a map.
 */
function TableRow<T>({
  row,
  index,
  columns,
  primaryIndex,
  selected,
  zebra,
  onRowClick,
}: TableRowProps<T>) {
  const clickable = Boolean(onRowClick)
  const { pressProps } = usePressFeedback(!clickable)

  /*
   * The row click is a convenience for the pointer; the keyboard path is the
   * real <button> in the primary cell. Clicks that land on any control are
   * ignored here — that stops the button counting twice, and stops a Switch or
   * a link rendered by a column from activating the row behind it.
   */
  const onClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (!onRowClick) return
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea, label')) return
    onRowClick(row, index)
  }

  return (
    <tr
      {...(clickable ? pressProps : null)}
      onClick={clickable ? onClick : undefined}
      data-clickable={clickable ? 'true' : undefined}
      data-selected={selected ? 'true' : undefined}
      data-zebra={zebra ? 'true' : undefined}
      // Matches ListRow: a row flashes its background rather than scaling, so
      // it takes may-hoverable but not may-pressable — scaling one <tr> tears
      // it away from the columns either side of it.
      className={cx('may-table__row', clickable && 'may-hoverable')}
      style={{ '--may-table-row-i': Math.min(index, STAGGER_CAP) } as CSSProperties}
    >
      {columns.map((column, columnIndex) => {
        const content = cellContent(column, row, index)
        const isPrimary = columnIndex === primaryIndex

        return (
          <td
            key={column.key}
            className="may-table__cell"
            data-align={alignOf(column)}
            data-numeric={column.numeric ? 'true' : undefined}
          >
            {clickable && isPrimary ? (
              // The activator carries no styling of its own: the row is what
              // lights up. It exists so the row is reachable by keyboard and
              // announced as activatable, which a <tr onClick> never is.
              <button
                type="button"
                className="may-table__activator"
                onClick={() => onRowClick?.(row, index)}
              >
                {content}
                {selected && <span className="may-sr-only">Selected</span>}
              </button>
            ) : (
              content
            )}
          </td>
        )
      })}
    </tr>
  )
}

/**
 * An adaptive data table.
 *
 * Above `--may-breakpoint-desktop` this is a real `<table>` — sticky header,
 * tabular figures in numeric columns, selectable hoverable rows. Below it the
 * same records collapse into grouped List rows: the primary column becomes the
 * title, the last column becomes the trailing detail, and everything between
 * them reads as the subtitle. That reshape is the whole point — the consumer
 * describes the data once and never writes a phone layout.
 *
 * Row backgrounds are painted on the CELLS rather than on the `<tr>`, which is
 * what lets zebra, selection and press stack as translucent washes over the
 * hover fill base.css puts on the row, with no state having to out-specify
 * another.
 */
export function Table<T>({
  columns,
  data,
  rowKey,
  selectedKeys,
  onRowClick,
  size = 'md',
  stickyHeader = false,
  zebra = false,
  emptyState,
  caption,
  maxHeight,
  className,
  style,
  ...rest
}: TableProps<T>) {
  const isDesktop = useIsDesktop()
  const captionId = useAutoId()
  const selected = selectedKeys ? new Set(selectedKeys) : NO_SELECTION
  const isEmpty = data.length === 0

  const primaryIndex = Math.max(
    0,
    columns.findIndex((column) => column.primary),
  )

  const vars: Record<string, string> = {}
  if (maxHeight !== undefined) {
    vars['--may-table-max'] = typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight)
  }

  const root = {
    'data-slot': 'table',
    'data-size': size,
    'data-sticky': stickyHeader ? ('true' as const) : undefined,
    'data-bounded': maxHeight !== undefined ? ('true' as const) : undefined,
    style: { ...vars, ...style } as CSSProperties,
  }

  const sectionTitle = caption && (
    <div className="may-table__caption" id={captionId}>
      {caption}
    </div>
  )

  /* ------------------------------- collapsed ------------------------------ */

  if (!isDesktop) {
    /*
     * The trailing detail is the last column that is not the title — a table's
     * final column is nearly always its headline value (a size, a date, a
     * status), which is exactly what iOS parks on the trailing edge of a row.
     * The columns between the two become the subtitle as values only: at 390px
     * repeating every header would double each line for no extra meaning, and
     * the title already says which record you are reading.
     */
    const detailIndex =
      columns.length < 2
        ? -1
        : primaryIndex === columns.length - 1
          ? columns.length - 2
          : columns.length - 1
    const primaryColumn = columns[primaryIndex]

    return (
      <div {...rest} {...root} data-layout="stacked" className={cx('may-table', className)}>
        {sectionTitle}
        <List variant="inset" aria-labelledby={caption ? captionId : undefined}>
          {isEmpty
            ? emptyState && <div className="may-table__empty">{emptyState}</div>
            : data.map((row, index) => {
                const key = resolveKey(rowKey, row, index)
                const isSelected = selected.has(key)
                const detail = detailIndex >= 0 ? columns[detailIndex] : undefined

                const subtitleParts = columns
                  .filter((_, i) => i !== primaryIndex && i !== detailIndex)
                  .map((column) => cellContent(column, row, index))
                  .filter((part) => part !== null && part !== undefined && part !== '')

                return (
                  <ListRow
                    key={key}
                    className="may-table__mrow"
                    style={{ '--may-table-row-i': Math.min(index, STAGGER_CAP) } as CSSProperties}
                    title={primaryColumn ? cellContent(primaryColumn, row, index) : null}
                    subtitle={
                      subtitleParts.length > 0
                        ? subtitleParts.map((part, i) => (
                            <Fragment key={i}>
                              {i > 0 && (
                                <span className="may-table__sep" aria-hidden>
                                  ·
                                </span>
                              )}
                              {part}
                            </Fragment>
                          ))
                        : undefined
                    }
                    detail={
                      detail ? (
                        <span className="may-table__value" data-numeric={detail.numeric ? 'true' : undefined}>
                          {cellContent(detail, row, index)}
                        </span>
                      ) : undefined
                    }
                    // A checkmark rather than a row wash: on iOS selection in a
                    // grouped list is a tinted glyph on the trailing edge, and
                    // it survives being read aloud in a way a colour does not.
                    accessory={
                      isSelected ? (
                        <IoCheckmark
                          className="may-table__check"
                          role="img"
                          aria-label="Selected"
                        />
                      ) : undefined
                    }
                    onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  />
                )
              })}
        </List>
      </div>
    )
  }

  /* -------------------------------- desktop ------------------------------- */

  const hasWidths = columns.some((column) => column.width !== undefined)

  return (
    <div {...rest} {...root} data-layout="table" className={cx('may-table', className)}>
      {sectionTitle}
      <div
        className="may-table__scroller"
        // Borrows the one set of rules in base.css that thins the scrollbar,
        // insets its thumb and contains overscroll — the same slot Sheet's body
        // uses for the same reason.
        data-slot="scroll-area"
        // A scroll region needs to be keyboard-reachable, but only when nothing
        // inside it already is: rows with an activator supply their own stops.
        tabIndex={maxHeight !== undefined && !onRowClick ? 0 : undefined}
      >
        <table
          className="may-table__table"
          aria-labelledby={caption ? captionId : undefined}
          // Cell values are content, not chrome: base.css makes app furniture
          // unselectable by default, and a serial number you cannot copy out of
          // a table is the wrong side of that trade.
          data-selectable
        >
          {hasWidths && (
            <colgroup>
              {columns.map((column) => (
                <col
                  key={column.key}
                  style={column.width !== undefined ? { width: column.width } : undefined}
                />
              ))}
            </colgroup>
          )}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="may-table__head-cell"
                  data-align={alignOf(column)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isEmpty
              ? emptyState && (
                  <tr>
                    <td className="may-table__empty" colSpan={columns.length}>
                      {emptyState}
                    </td>
                  </tr>
                )
              : data.map((row, index) => {
                  const key = resolveKey(rowKey, row, index)
                  return (
                    <TableRow
                      key={key}
                      row={row}
                      index={index}
                      columns={columns}
                      primaryIndex={primaryIndex}
                      selected={selected.has(key)}
                      // Read off the data index, not nth-child: a filtered table
                      // must keep striping the records, not the surviving DOM.
                      zebra={zebra && index % 2 === 1}
                      onRowClick={onRowClick}
                    />
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
