import type { CSSProperties, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { isValidElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { draggable } from '../../motion/gesture'
import type { MaySize } from '../../types'
import { Checkbox } from '../../components/Checkbox'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Pagination } from '../../components/Pagination'
/*
 * The card, the hairlines, the cell metrics and the row washes are Table's, and
 * this component renders Table's own class names to inherit all four rather
 * than restating them. That makes the stylesheet a VALUE import: a type-only
 * import is erased at compile time and Storybook then code-splits those rules
 * away, rendering the whole table unstyled.
 *
 * Checkbox, Input, Select and Pagination arrive as modules, so each brings its
 * own stylesheet with it. DataTable.css is imported last on purpose — the few
 * rules here that reshape those controls for a table cell have to land after
 * the rules they are narrowing.
 */

export type DataTableSortDirection = 'asc' | 'desc'

/** One key of a multi-key sort. Earlier entries win; later ones break ties. */
export interface DataTableSort {
  key: string
  direction: DataTableSortDirection
}

/** Filter text per column key. An empty string means "not filtered". */
export type DataTableFilters = Record<string, string>

/** What a column contributes to sorting and filtering. */
export type DataTableValue = string | number | boolean | null | undefined

export interface DataTableColumn<T> {
  /** Column identity, and the property read off the record when there is no `render`. */
  key: string
  header: ReactNode
  /** Overrides the alignment that `numeric` implies. */
  align?: 'start' | 'center' | 'end'
  /** End-aligns the column and switches on tabular figures, so digits stack. */
  numeric?: boolean
  /** Starting width in px. Dragging the grip writes over it. */
  width?: number
  /** Floor for the resize drag, in px. @default 72 */
  minWidth?: number
  render?: (row: T, index: number) => ReactNode
  /**
   * The value sorting and filtering see. Defaults to the raw property, which is
   * read only when it is a primitive — a Date, an array or a nested object is
   * exactly the case this exists for.
   */
  value?: (row: T) => DataTableValue
  /** @default true */
  sortable?: boolean
  /** `text` matches a substring; `select` offers the column's own distinct values. */
  filter?: 'text' | 'select'
  /** @default true when the table is resizable */
  resizable?: boolean
}

/** Either a property name on the record, or a function deriving the key. */
export type DataTableRowKey<T> = (keyof T & string) | ((row: T, index: number) => string | number)

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Identity of a record. Stable keys are what let rows move rather than remount. */
  rowKey: DataTableRowKey<T>
  /** Row height rung. @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  /** Section title above the card, in the iOS grouped style. Labels the table. */
  caption?: ReactNode

  /** Controlled multi-key sort. */
  sort?: DataTableSort[]
  defaultSort?: DataTableSort[]
  onSortChange?: (sort: DataTableSort[]) => void

  /** Controlled per-column filters. */
  filters?: DataTableFilters
  defaultFilters?: DataTableFilters
  onFiltersChange?: (filters: DataTableFilters) => void

  /** Adds the checkbox column and the header select-all. */
  selectable?: boolean
  selectedKeys?: readonly string[]
  defaultSelectedKeys?: readonly string[]
  onSelectionChange?: (keys: string[]) => void

  onRowClick?: (row: T, index: number) => void

  /** Lets every column be widened or narrowed by dragging the hairline beside it. */
  resizableColumns?: boolean
  /** Pins the header row. Needs `maxHeight` to have a scrollport to pin to. @default true */
  stickyHeader?: boolean
  /** Pins the checkbox column and the first data column against horizontal scroll. */
  stickyColumn?: boolean

  /** Rows per page. Omit for one continuous list. */
  pageSize?: number
  /** Window the rows instead of paging them. Ignored when `pageSize` is set. */
  virtualized?: boolean
  /** Row height in px for the virtualiser. Measured from the first row when omitted. */
  rowHeight?: number

  /** Bounds the scrollport. A number is read as px. */
  maxHeight?: number | string
  /** Alternating row wash. */
  zebra?: boolean
  /** Shown when there are no records at all. */
  emptyState?: ReactNode
  /** Shown when filters have excluded every record. Falls back to `emptyState`. */
  noResultsState?: ReactNode
  /** @default 'Select all rows' */
  selectAllLabel?: string
}

/** Rows past this index all share the last stagger step — see Table.css. */
const STAGGER_CAP = 10

/** Default floor for a resize drag. Narrower than this and a header stops being readable. */
const MIN_COLUMN_WIDTH = 72

/** One arrow press on a focused resize grip. */
const RESIZE_STEP = 16

/** Rows rendered beyond each edge of the viewport, so a fast flick never shows a gap. */
const OVERSCAN = 6

/**
 * Fallback row heights, in px, matching --may-control-h-sm/md/lg. Only ever
 * used for the very first virtualised frame: the real height is measured off
 * the first rendered row and takes over immediately.
 */
const FALLBACK_ROW_HEIGHT: Record<Exclude<MaySize, 'xs'>, number> = { sm: 36, md: 44, lg: 52 }

/**
 * Numeric-aware and locale-aware, so "iPhone 15" sorts after "iPhone 9" instead
 * of before it — the single most common sorting bug in a device table.
 */
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function resolveKey<T>(rowKey: DataTableRowKey<T>, row: T, index: number): string {
  if (typeof rowKey === 'function') return String(rowKey(row, index))
  const raw = (row as Record<string, unknown>)[rowKey]
  return raw == null ? String(index) : String(raw)
}

/**
 * What a cell paints. Without a `render` the raw property is used, but only
 * when it is something React can actually show — a Date or a nested object
 * would otherwise reach the DOM as "[object Object]", which is worse than blank
 * and much harder to notice.
 */
function cellContent<T>(column: DataTableColumn<T>, row: T, index: number): ReactNode {
  if (column.render) return column.render(row, index)
  const raw = (row as Record<string, unknown>)[column.key]
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return isValidElement(raw) ? raw : null
}

/** What sorting and filtering compare. Non-primitives are what `value` is for. */
function valueOf<T>(column: DataTableColumn<T>, row: T): DataTableValue {
  if (column.value) return column.value(row)
  const raw = (row as Record<string, unknown>)[column.key]
  if (raw == null) return undefined
  return typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean'
    ? raw
    : undefined
}

const isBlank = (value: DataTableValue) => value == null || value === ''

function compareValues(a: DataTableValue, b: DataTableValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b)
  return COLLATOR.compare(String(a), String(b))
}

/** `numeric` implies end alignment; resolved here so header, filter and body agree. */
function alignOf<T>(column: DataTableColumn<T>): 'start' | 'center' | 'end' {
  return column.align ?? (column.numeric ? 'end' : 'start')
}

/**
 * Where a header click takes the sort.
 *
 * A plain click resets to a single key — that is what someone means when they
 * click a second header having forgotten the first. Shift-click is additive and
 * keeps priority order, so the clicked column stays wherever it already sat in
 * the chain rather than jumping to the front and silently reordering the table.
 *
 * Each key cycles ascending -> descending -> off, because a sort you cannot
 * remove is a sort you have to reload the page to escape.
 */
function nextSort(current: DataTableSort[], key: string, additive: boolean): DataTableSort[] {
  const existing = current.find((entry) => entry.key === key)
  const next: DataTableSort | null = !existing
    ? { key, direction: 'asc' }
    : existing.direction === 'asc'
      ? { key, direction: 'desc' }
      : null

  if (!additive) return next ? [next] : []
  if (!existing) return [...current, { key, direction: 'asc' }]
  return current.flatMap((entry) => (entry.key !== key ? [entry] : next ? [next] : []))
}

/* -------------------------------------------------------------------------- *
 * Header
 * -------------------------------------------------------------------------- */

interface SortGlyphProps {
  direction: DataTableSortDirection | null
  /** 1-based position in a multi-key sort, or null when there is only one key. */
  rank: number | null
}

/** One chevron that rotates between the two directions, rather than two glyphs. */
function SortGlyph({ direction, rank }: SortGlyphProps) {
  return (
    <span className="may-datatable__sort" data-direction={direction ?? undefined} aria-hidden>
      <svg viewBox="0 0 16 16" focusable="false">
        <path
          d="M3.5 6L8 10.5L12.5 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {rank !== null && <span className="may-datatable__rank">{rank}</span>}
    </span>
  )
}

interface ResizeGripProps {
  columnKey: string
  label: string
  min: number
  /** Must be stable across renders — see the note in the effect below. */
  onResize: (key: string, width: number) => void
}

/**
 * The hairline between two headers, made draggable.
 *
 * The starting width is read off the live `<th>` rather than off state: the
 * table may still be auto-sizing on the first drag, and a measured start is the
 * only one that cannot disagree with what the user is looking at.
 *
 * It is a `separator` with a tabstop, not a `<div onPointerDown>` — the ARIA
 * window-splitter pattern — so the column can also be resized with the arrow
 * keys by anyone who cannot hold and drag a 6px target.
 */
function ResizeGrip({ columnKey, label, min, onResize }: ResizeGripProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [dragging, setDragging] = useState(false)

  /*
   * Everything this depends on is stable, so the listeners attach once. An
   * inline arrow for `onResize` would tear them down and rebuild them on every
   * render — including the renders the drag itself causes, which kills the drag
   * on its own first frame.
   */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cell = el.closest('th')
    let start = 0

    return draggable(el, {
      axis: 'x',
      // No dead zone: a grip that ignores the first four pixels feels stuck.
      threshold: 0,
      onStart: () => {
        start = cell?.getBoundingClientRect().width ?? min
        setDragging(true)
      },
      onMove: ({ dx }) => onResize(columnKey, Math.max(min, Math.round(start + dx))),
      onEnd: () => setDragging(false),
    })
  }, [columnKey, min, onResize])

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const delta = event.key === 'ArrowRight' ? RESIZE_STEP : event.key === 'ArrowLeft' ? -RESIZE_STEP : 0
    if (!delta) return
    event.preventDefault()
    const width = event.currentTarget.closest('th')?.getBoundingClientRect().width ?? min
    onResize(columnKey, Math.max(min, Math.round(width + delta)))
  }

  return (
    <span
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-dragging={dragging ? 'true' : undefined}
      className="may-datatable__grip"
    />
  )
}

/* -------------------------------------------------------------------------- *
 * Row
 * -------------------------------------------------------------------------- */

interface DataTableRowProps<T> {
  row: T
  /** Index within the source data, so a filtered table keeps striping records. */
  index: number
  /** Index within the rendered page, which drives the entrance stagger. */
  renderIndex: number
  columns: DataTableColumn<T>[]
  selected: boolean
  selectable: boolean
  selectLabel: string
  onToggle: () => void
  zebra: boolean
  stickyColumn: boolean
  onRowClick?: (row: T, index: number) => void
}

/**
 * One `<tr>`.
 *
 * Its own component because press feedback is a hook, and a hook cannot be
 * called inside a map.
 */
function DataTableRow<T>({
  row,
  index,
  renderIndex,
  columns,
  selected,
  selectable,
  selectLabel,
  onToggle,
  zebra,
  stickyColumn,
  onRowClick,
}: DataTableRowProps<T>) {
  const clickable = Boolean(onRowClick)
  const { pressProps } = usePressFeedback(!clickable)

  /*
   * The row click is a convenience for the pointer; the keyboard path is the
   * real <button> in the first data cell. Clicks landing on any control are
   * ignored here, which stops the activator counting twice and stops the
   * checkbox — or anything a column renders — activating the row behind it.
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
      // Matches Table and ListRow: a row flashes its background rather than
      // scaling, so it takes may-hoverable but not may-pressable — scaling one
      // <tr> tears it away from the columns either side of it.
      className={cx('may-table__row', clickable && 'may-hoverable')}
      style={{ '--may-table-row-i': Math.min(renderIndex, STAGGER_CAP) } as CSSProperties}
    >
      {selectable && (
        <td
          className={cx('may-table__cell', 'may-datatable__select-cell', stickyColumn && 'may-datatable__pinned')}
          data-pin={stickyColumn ? 'lead' : undefined}
        >
          <Checkbox
            size="sm"
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={selectLabel}
            className="may-datatable__check"
          />
        </td>
      )}
      {columns.map((column, columnIndex) => {
        const content = cellContent(column, row, index)
        const pinned = stickyColumn && columnIndex === 0

        return (
          <td
            key={column.key}
            className={cx('may-table__cell', pinned && 'may-datatable__pinned')}
            data-pin={pinned ? 'body' : undefined}
            data-align={alignOf(column)}
            data-numeric={column.numeric ? 'true' : undefined}
          >
            {clickable && columnIndex === 0 ? (
              // The activator carries no styling of its own — the row is what
              // lights up. It exists so the row is reachable by keyboard and
              // announced as activatable, which a <tr onClick> never is.
              <button
                type="button"
                className="may-table__activator"
                onClick={() => onRowClick?.(row, index)}
              >
                {content}
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

/* -------------------------------------------------------------------------- *
 * DataTable
 * -------------------------------------------------------------------------- */

/**
 * The feature-rich table the adaptive `Table` deliberately is not.
 *
 * `Table` reshapes into grouped List rows on a phone, and that reshape is the
 * reason it stays simple: nothing it offers may depend on a pointer. Everything
 * here does. Multi-key sorting, per-column filters, a header select-all, drag
 * resizing, two pinned axes and a virtualiser are all mouse-and-keyboard work,
 * so they live in `mayui/desktop` instead of being bolted onto a component that
 * has to survive at 390px.
 *
 * What it does NOT own is the look. Every visual — the grouped card, the
 * per-cell hairlines, the row washes stacking over the shared hover fill, the
 * staggered entrance — comes from Table's stylesheet, rendered through Table's
 * own class names. This file adds logic and four affordances (sort glyph,
 * filter row, resize grip, pinned edge) and nothing else.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  size = 'md',
  caption,
  sort: sortProp,
  defaultSort,
  onSortChange,
  filters: filtersProp,
  defaultFilters,
  onFiltersChange,
  selectable = false,
  selectedKeys: selectedProp,
  defaultSelectedKeys,
  onSelectionChange,
  onRowClick,
  resizableColumns = false,
  stickyHeader = true,
  stickyColumn = false,
  pageSize,
  virtualized = false,
  rowHeight,
  maxHeight,
  zebra = false,
  emptyState,
  noResultsState,
  selectAllLabel = 'Select all rows',
  className,
  style,
  ...rest
}: DataTableProps<T>) {
  const captionId = useAutoId()

  /* ------------------------------ controlled state ----------------------- */

  const [internalSort, setInternalSort] = useState<DataTableSort[]>(defaultSort ?? [])
  const sort = sortProp ?? internalSort
  const commitSort = (next: DataTableSort[]) => {
    if (sortProp === undefined) setInternalSort(next)
    onSortChange?.(next)
  }

  const [internalFilters, setInternalFilters] = useState<DataTableFilters>(defaultFilters ?? {})
  const filters = filtersProp ?? internalFilters
  const commitFilter = (key: string, value: string) => {
    const next = { ...filters, [key]: value }
    if (!value) delete next[key]
    if (filtersProp === undefined) setInternalFilters(next)
    onFiltersChange?.(next)
  }

  const [internalSelected, setInternalSelected] = useState<readonly string[]>(
    defaultSelectedKeys ?? [],
  )
  const selectedKeys = selectedProp ?? internalSelected
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const commitSelection = (next: string[]) => {
    if (selectedProp === undefined) setInternalSelected(next)
    onSelectionChange?.(next)
  }

  /* ---------------------------------- data -------------------------------- */

  const filterable = columns.some((column) => column.filter)

  /** Distinct values per `select` column, in the order they first appear. */
  const selectOptions = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const column of columns) {
      if (column.filter !== 'select') continue
      const seen = new Set<string>()
      for (const row of data) {
        const value = valueOf(column, row)
        if (isBlank(value)) continue
        seen.add(String(value))
      }
      map.set(column.key, [...seen])
    }
    return map
  }, [columns, data])

  /**
   * Filter, then sort, then remember the source index. Every row carries the
   * index it had in `data` so zebra striping keeps counting records rather than
   * surviving DOM nodes — a filtered table that restripes as you type looks
   * broken even when the data is right.
   */
  const rows = useMemo(() => {
    const active = columns.filter((column) => column.filter && filters[column.key])

    let out = data.map((row, index) => ({ row, index }))

    if (active.length) {
      out = out.filter(({ row }) =>
        active.every((column) => {
          const needle = filters[column.key]!
          const value = valueOf(column, row)
          const hay = isBlank(value) ? '' : String(value)
          return column.filter === 'select'
            ? hay === needle
            : hay.toLowerCase().includes(needle.trim().toLowerCase())
        }),
      )
    }

    if (sort.length) {
      const byKey = new Map(columns.map((column) => [column.key, column]))
      // Array.prototype.sort has been stable since ES2019, so records the sort
      // keys cannot separate keep the order they arrived in.
      out = [...out].sort((a, b) => {
        for (const { key, direction } of sort) {
          const column = byKey.get(key)
          if (!column) continue
          const av = valueOf(column, a.row)
          const bv = valueOf(column, b.row)
          // Blanks always sink, in BOTH directions. Flipping them with the
          // sort would open a descending column with a screen of empty cells,
          // which is never what "sort by this" meant.
          if (isBlank(av) || isBlank(bv)) {
            if (isBlank(av) && isBlank(bv)) continue
            return isBlank(av) ? 1 : -1
          }
          const delta = compareValues(av, bv)
          if (delta !== 0) return direction === 'asc' ? delta : -delta
        }
        return 0
      })
    }

    return out
  }, [data, columns, filters, sort])

  const total = rows.length
  const filtered = total !== data.length

  /* -------------------------------- paging -------------------------------- */

  const [page, setPage] = useState(1)
  const pageCount = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1

  // Typing into a filter can shrink the set out from under the current page.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  const paged = useMemo(
    () => (pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows),
    [rows, pageSize, page],
  )

  /* ------------------------------ scroll state ---------------------------- */

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewport, setViewport] = useState(0)
  const [scrolledX, setScrolledX] = useState(false)
  const windowing = virtualized && !pageSize

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let frame = 0

    const read = () => {
      frame = 0
      setScrolledX(el.scrollLeft > 0)
      if (windowing) setScrollTop(el.scrollTop)
    }
    // Scroll fires far faster than the compositor paints; coalescing to one
    // frame is the difference between a virtualiser that glides and one that
    // re-renders three times per row.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    read()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      el.removeEventListener('scroll', onScroll)
    }
  }, [windowing])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setViewport(el.clientHeight))
    ro.observe(el)
    setViewport(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  /* ----------------------------- virtualisation --------------------------- */

  const [measuredRowHeight, setMeasuredRowHeight] = useState<number | null>(null)
  const unitHeight = rowHeight ?? measuredRowHeight ?? FALLBACK_ROW_HEIGHT[size]

  /*
   * Row height is measured, not assumed. The rung is a token that a consumer
   * can override, and a virtualiser working from a stale constant drifts a
   * pixel per row until the spacer and the rows disagree by a whole screen.
   */
  useIsomorphicLayoutEffect(() => {
    if (!windowing || rowHeight !== undefined) return
    // Queried rather than held on a ref: DataTableRow is a plain function
    // component, and forwarding a ref through it for one measurement would put
    // a forwardRef wrapper on every row in the table.
    const el = scrollerRef.current?.querySelector('tbody .may-table__row')
    if (!el) return
    const height = Math.round(el.getBoundingClientRect().height)
    if (height > 0 && height !== measuredRowHeight) setMeasuredRowHeight(height)
  }, [windowing, rowHeight, measuredRowHeight, size, paged.length])

  const windowStart = windowing ? Math.max(0, Math.floor(scrollTop / unitHeight) - OVERSCAN) : 0
  const windowEnd = windowing
    ? Math.min(paged.length, windowStart + Math.ceil(viewport / unitHeight) + OVERSCAN * 2)
    : paged.length
  const visible = windowing ? paged.slice(windowStart, windowEnd) : paged

  /* ------------------------------ column widths --------------------------- */

  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {}
    for (const column of columns) if (column.width !== undefined) seed[column.key] = column.width
    return seed
  })
  const headRefs = useRef<Record<string, HTMLTableCellElement | null>>({})
  const [autoSized, setAutoSized] = useState(false)
  const signature = columns.map((column) => column.key).join(' ')
  const sizedFor = useRef<string | null>(null)

  /*
   * Resizing needs `table-layout: fixed`, and fixed layout needs every column
   * to have a width — but a width the author never chose is a width that
   * ignores the content. So the table renders once under auto layout, its own
   * chosen widths are measured, and only then does it switch to fixed. The user
   * sees the layout the browser would have picked, and can then drag it.
   */
  useIsomorphicLayoutEffect(() => {
    if (!resizableColumns || sizedFor.current === signature) return
    const measured: Record<string, number> = {}
    for (const column of columns) {
      const el = headRefs.current[column.key]
      if (el) measured[column.key] = Math.round(el.getBoundingClientRect().width)
    }
    sizedFor.current = signature
    // An explicit `width` outranks the measurement, and so does a drag already
    // in the state — remeasuring must never undo a column the user has set.
    setWidths((current) => ({ ...measured, ...current }))
    setAutoSized(true)
  }, [resizableColumns, signature, columns])

  const resizeColumn = useCallback((key: string, width: number) => {
    setWidths((current) => (current[key] === width ? current : { ...current, [key]: width }))
  }, [])

  /* ------------------------------- selection ------------------------------ */

  /*
   * Select-all covers every row that survives the filters, not only the page
   * under the box. Once someone has filtered to "Documents", "all" means all
   * the documents — a box that quietly stopped at the page boundary would be
   * the more surprising of the two, and silently under-delete.
   */
  const allKeys = useMemo(
    () => rows.map(({ row, index }) => resolveKey(rowKey, row, index)),
    [rows, rowKey],
  )
  const selectedHere = allKeys.filter((key) => selectedSet.has(key)).length
  const allSelected = allKeys.length > 0 && selectedHere === allKeys.length
  const someSelected = selectedHere > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      const drop = new Set(allKeys)
      commitSelection(selectedKeys.filter((key) => !drop.has(key)))
    } else {
      commitSelection([...new Set([...selectedKeys, ...allKeys])])
    }
  }

  const toggleRow = (key: string) =>
    commitSelection(
      selectedSet.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key],
    )

  /* --------------------------------- render ------------------------------- */

  const columnCount = columns.length + (selectable ? 1 : 0)
  const isEmpty = paged.length === 0
  const empty = filtered ? (noResultsState ?? emptyState) : emptyState

  const vars: Record<string, string> = {}
  if (maxHeight !== undefined) {
    vars['--may-table-max'] = typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight)
  }

  const sortIndex = new Map(sort.map((entry, index) => [entry.key, index]))

  const headCell = (column: DataTableColumn<T>) => {
    const sortable = column.sortable !== false
    const rank = sortIndex.get(column.key)
    const direction = rank === undefined ? null : sort[rank]!.direction
    const canResize = resizableColumns && column.resizable !== false
    const label = typeof column.header === 'string' ? column.header : column.key

    return (
      <>
        {sortable ? (
          <button
            type="button"
            className="may-datatable__sorter"
            // Shift-click is discoverable only if it is announced; the title is
            // the one place a mouse user will actually look for it.
            title={`Sort by ${label} — hold Shift to add to the current sort`}
            onClick={(event) => commitSort(nextSort(sort, column.key, event.shiftKey))}
          >
            <span className="may-datatable__label">{column.header}</span>
            <SortGlyph direction={direction} rank={sort.length > 1 && rank !== undefined ? rank + 1 : null} />
          </button>
        ) : (
          <span className="may-datatable__label">{column.header}</span>
        )}
        {canResize && (
          <ResizeGrip
            columnKey={column.key}
            label={label}
            min={column.minWidth ?? MIN_COLUMN_WIDTH}
            onResize={resizeColumn}
          />
        )}
      </>
    )
  }

  return (
    <div
      {...rest}
      data-slot="data-table"
      data-size={size}
      data-selectable={selectable ? 'true' : undefined}
      data-sticky-head={stickyHeader ? 'true' : undefined}
      data-sticky-column={stickyColumn ? 'true' : undefined}
      data-scrolled-x={scrolledX ? 'true' : undefined}
      // Reuses Table's own bounding rule — max-height plus overflow-y — rather
      // than restating it. Table's `data-sticky` is deliberately NOT set: it
      // switches the scroller to `overflow: visible` when unbounded, which
      // would unpin the first column as well as the header.
      data-bounded={maxHeight !== undefined ? 'true' : undefined}
      data-fixed={resizableColumns && autoSized ? 'true' : undefined}
      className={cx('may-table', 'may-datatable', className)}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {caption && (
        <div className="may-table__caption" id={captionId}>
          {caption}
        </div>
      )}

      <div className="may-table__scroller may-datatable__scroller" ref={scrollerRef} data-slot="scroll-area">
        <table className="may-table__table" aria-labelledby={caption ? captionId : undefined}>
          <colgroup>
            {selectable && <col className="may-datatable__select-col" />}
            {columns.map((column) => (
              <col
                key={column.key}
                style={widths[column.key] !== undefined ? { width: widths[column.key] } : undefined}
              />
            ))}
          </colgroup>

          <thead className="may-table__head">
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className={cx(
                    'may-table__head-cell',
                    'may-datatable__select-cell',
                    stickyColumn && 'may-datatable__pinned',
                  )}
                  data-pin={stickyColumn ? 'lead' : undefined}
                >
                  <Checkbox
                    size="sm"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleAll}
                    aria-label={selectAllLabel}
                    className="may-datatable__check"
                  />
                </th>
              )}
              {columns.map((column, columnIndex) => {
                const rank = sortIndex.get(column.key)
                const pinned = stickyColumn && columnIndex === 0
                return (
                  <th
                    key={column.key}
                    ref={(node) => {
                      headRefs.current[column.key] = node
                    }}
                    scope="col"
                    aria-sort={
                      rank === undefined
                        ? column.sortable === false
                          ? undefined
                          : 'none'
                        : sort[rank]!.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                    }
                    className={cx('may-table__head-cell', pinned && 'may-datatable__pinned')}
                    data-pin={pinned ? 'body' : undefined}
                    data-align={alignOf(column)}
                  >
                    {headCell(column)}
                  </th>
                )
              })}
            </tr>

            {filterable && (
              <tr>
                {/* <td>, not <th>: these cells hold controls, and announcing
                  * them as column headers would double every cell's name. */}
                {selectable && (
                  <td
                    className={cx(
                      'may-datatable__filter-cell',
                      'may-datatable__select-cell',
                      stickyColumn && 'may-datatable__pinned',
                    )}
                    data-pin={stickyColumn ? 'lead' : undefined}
                  />
                )}
                {columns.map((column, columnIndex) => {
                  const pinned = stickyColumn && columnIndex === 0
                  const label = typeof column.header === 'string' ? column.header : column.key
                  return (
                    <td
                      key={column.key}
                      className={cx('may-datatable__filter-cell', pinned && 'may-datatable__pinned')}
                      data-pin={pinned ? 'body' : undefined}
                    >
                      {column.filter === 'select' ? (
                        <Select
                          size="sm"
                          fullWidth
                          placeholder="Any"
                          value={filters[column.key] ?? ''}
                          onValueChange={(value) => commitFilter(column.key, value)}
                          aria-label={`Filter by ${label}`}
                          options={(selectOptions.get(column.key) ?? []).map((value) => ({
                            label: value,
                            value,
                          }))}
                        />
                      ) : column.filter === 'text' ? (
                        <Input
                          size="sm"
                          fullWidth
                          type="search"
                          placeholder="Filter"
                          value={filters[column.key] ?? ''}
                          onChange={(event) => commitFilter(column.key, event.target.value)}
                          aria-label={`Filter by ${label}`}
                        />
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            )}
          </thead>

          <tbody>
            {isEmpty ? (
              empty && (
                <tr>
                  <td className="may-table__empty" colSpan={columnCount}>
                    {empty}
                  </td>
                </tr>
              )
            ) : (
              <>
                {/* Spacers stand in for the rows above and below the window.
                  * The top one is omitted at offset zero so the first visible
                  * row keeps its `:first-child` hairline suppression. */}
                {windowStart > 0 && (
                  <tr aria-hidden style={{ height: windowStart * unitHeight }}>
                    <td colSpan={columnCount} />
                  </tr>
                )}
                {visible.map(({ row, index }, offset) => {
                  const key = resolveKey(rowKey, row, index)
                  return (
                    <DataTableRow
                      key={key}
                      row={row}
                      index={index}
                      renderIndex={windowing ? windowStart + offset : offset}
                      columns={columns}
                      selected={selectedSet.has(key)}
                      selectable={selectable}
                      selectLabel={`Select row ${index + 1}`}
                      onToggle={() => toggleRow(key)}
                      zebra={zebra && index % 2 === 1}
                      stickyColumn={stickyColumn}
                      onRowClick={onRowClick}
                    />
                  )
                })}
                {windowing && windowEnd < paged.length && (
                  <tr aria-hidden style={{ height: (paged.length - windowEnd) * unitHeight }}>
                    <td colSpan={columnCount} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {(pageSize !== undefined || selectable) && !isEmpty && (
        <div className="may-datatable__footer">
          <span className="may-datatable__status" aria-live="polite">
            {selectable && selectedHere > 0
              ? `${selectedHere} of ${total} selected`
              : `${total} ${total === 1 ? 'row' : 'rows'}${filtered ? ` of ${data.length}` : ''}`}
          </span>
          {pageSize !== undefined && pageCount > 1 && (
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} size="sm" />
          )}
        </div>
      )}
    </div>
  )
}
