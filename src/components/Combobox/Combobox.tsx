import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IoCheckmark, IoChevronDown, IoClose } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import { useFieldControl } from '../Field/Field'
import { useDismissLayer, useExitDelay, useOpenState } from '../../overlay'
import { placeFloating } from '../Popover/Popover'
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { MaySize } from '../../types'

/** Matches the exit transition in Combobox.css. */
const EXIT_MS = 150
/** Gap between the control and the popup, in px — `--may-space-1` in geometry. */
const OFFSET = 4

export interface ComboboxOption {
  value: string
  /** Row text. Also what typing filters against. */
  label: string
  /** Second line, shown muted under the label. */
  description?: string
  /** Leading glyph. A bare `<svg>` is scaled to the row by CSS. */
  icon?: ReactNode
  disabled?: boolean
  /** Groups rows under a heading. Rows with no group come first, in order. */
  group?: string
}

export interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value'> {
  /**
   * Optional rather than required, because the rows usually arrive from a
   * fetch: `options={data}` should render an empty picker while `data` is
   * still undefined, not throw.
   */
  options?: ComboboxOption[]
  /** Controlled selection. A string for single, an array when `multiple`. */
  value?: string | string[]
  /** Uncontrolled initial selection. */
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  /** Allow more than one selection, shown as removable tags. @default false */
  multiple?: boolean
  /** Shown when nothing is selected. */
  placeholder?: string
  /** @default 'md' */
  size?: Exclude<MaySize, 'xs'>
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  disabled?: boolean
  /** @default false */
  fullWidth?: boolean
  /** Lets typing filter the rows. Off makes it a listbox, not a combobox. @default true */
  searchable?: boolean
  /** Adds a clear control once something is selected. @default true */
  clearable?: boolean
  /** Shown when the filter matches nothing. @default 'No matches' */
  emptyLabel?: ReactNode
  /**
   * Submits the selection under this name inside a `<form>`.
   *
   * The control is a text input over a listbox, so the input itself holds the
   * query rather than the value. A hidden input carries the selection, one per
   * value when `multiple`, which is what `FormData.getAll` expects.
   */
  name?: string
  /**
   * Replace a row's content entirely. The row keeps its semantics, its
   * selected state and its keyboard behaviour — only the inside is yours.
   */
  renderOption?: (option: ComboboxOption, state: { selected: boolean; active: boolean }) => ReactNode
  /** Accessible name when there is no surrounding `Field`. */
  'aria-label'?: string
}

const asArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : value === '' ? [] : [value]

/**
 * A searchable, optionally multi-select picker.
 *
 * `Select` is a real `<select>`, which is the right answer whenever the native
 * picker is: it is free, it is accessible, and on a phone it is the platform's
 * own wheel. It cannot search, cannot hold more than one value legibly, and
 * cannot draw a row — so anything with more than a dozen options, or a second
 * line per row, had no component here at all.
 *
 * This is the other shape: a text input that owns a query, over a listbox that
 * owns the rows. `role="combobox"` with `aria-activedescendant` means focus
 * stays in the input while the active row moves, which is what lets you keep
 * typing to narrow and arrow to choose without ever leaving the field.
 */
export function Combobox({
  options = [],
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  placeholder,
  size = 'md',
  invalid,
  disabled,
  fullWidth = false,
  searchable = true,
  clearable = true,
  emptyLabel = 'No matches',
  name,
  renderOption,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  ...rest
}: ComboboxProps) {
  /*
   * Resolve the Field FIRST, then derive.
   *
   * It was the other way round: `useAutoId(id)` always returns an id, and
   * handing that to `useFieldControl` meant `own.id ?? field?.id` could never
   * reach the Field's — so a `<Field label="…">` around a Combobox emitted a
   * `<label for>` naming an id the input did not have, and the visible label
   * was not the input's accessible name. FieldContextValue says a control
   * must adopt the Field's id verbatim; this now does, and the row and list
   * ids still derive from whatever it ends up being.
   */
  const field = useFieldControl({ id, invalid, disabled, 'aria-describedby': describedBy })
  const autoId = useAutoId(field.id)
  const listId = `${autoId}-list`
  const isDisabled = field.disabled ?? false

  const [uncontrolled, setUncontrolled] = useState(() => asArray(defaultValue))
  const selected = valueProp !== undefined ? asArray(valueProp) : uncontrolled

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const reducedMotion = useReducedMotion()
  const { open, setOpen } = useOpenState({ onOpenChange: undefined })
  const mounted = useExitDelay(open, reducedMotion ? 0 : EXIT_MS)

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const commit = useCallback(
    (next: string[]) => {
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(multiple ? next : (next[0] ?? ''))
    },
    [valueProp, onValueChange, multiple],
  )

  /* -------------------------------- filtering ------------------------------ */

  const matches = useMemo(() => {
    const q = searchable ? query.trim().toLowerCase() : ''
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query, searchable])

  /* Grouped for rendering, while `matches` stays flat for the keyboard. */
  const groups = useMemo(() => {
    const out: { heading?: string; rows: ComboboxOption[] }[] = []
    for (const option of matches) {
      const last = out[out.length - 1]
      if (last && last.heading === option.group) last.rows.push(option)
      else out.push({ heading: option.group, rows: [option] })
    }
    return out
  }, [matches])

  // A filter that shortens the list must not leave the active row past its end.
  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, matches.length - 1)))
  }, [matches.length])

  /* -------------------------------- placement ------------------------------ */

  const [position, setPosition] = useState<{ x: number; y: number; width: number } | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!mounted || !rootRef.current || !popupRef.current) return
    const anchor = rootRef.current.getBoundingClientRect()
    const panel = popupRef.current.getBoundingClientRect()
    const placed = placeFloating(
      anchor,
      { width: panel.width, height: panel.height },
      'bottom-start',
      OFFSET,
      rootRef.current,
    )
    setPosition({ x: placed.x, y: placed.y, width: anchor.width })
  }, [mounted, matches.length])

  /* -------------------------------- dismissal ------------------------------ */

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [setOpen])

  useDismissLayer({ open, onClose: close })

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || popupRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, close])

  /* --------------------------------- actions ------------------------------- */

  const toggleValue = (option: ComboboxOption) => {
    if (option.disabled) return
    if (multiple) {
      const next = selected.includes(option.value)
        ? selected.filter((v) => v !== option.value)
        : [...selected, option.value]
      commit(next)
      // A multi-select stays open: picking one of several and being dismissed
      // after each is the interaction everybody complains about.
      setQuery('')
      inputRef.current?.focus()
      return
    }
    commit([option.value])
    close()
    inputRef.current?.focus()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (!open) {
          setOpen(true)
          return
        }
        if (matches.length === 0) return
        const delta = event.key === 'ArrowDown' ? 1 : -1
        setActive((i) => (i + delta + matches.length) % matches.length)
        return
      }
      case 'Home':
        if (!open) return
        event.preventDefault()
        setActive(0)
        return
      case 'End':
        if (!open) return
        event.preventDefault()
        setActive(Math.max(0, matches.length - 1))
        return
      case 'Enter': {
        if (!open) {
          event.preventDefault()
          setOpen(true)
          return
        }
        const option = matches[active]
        if (!option) return
        event.preventDefault()
        toggleValue(option)
        return
      }
      case 'Backspace': {
        // Backspace on an empty query peels the last tag off, the way every
        // token field does. Only when there is nothing to delete first.
        if (!multiple || query !== '' || selected.length === 0) return
        commit(selected.slice(0, -1))
        return
      }
      default:
    }
  }

  /* -------------------------------- rendering ------------------------------ */

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options])
  const chosen = selected.map((v) => byValue.get(v)).filter(Boolean) as ComboboxOption[]
  const single = !multiple ? chosen[0] : undefined
  const showClear = clearable && !isDisabled && selected.length > 0

  // The input shows the query while open, and the selection while closed. A
  // combobox that kept the query visible after committing would read as if the
  // selection had not taken.
  const inputValue = open && searchable ? query : (single?.label ?? '')

  let flatIndex = -1

  return (
    <div
      {...rest}
      ref={rootRef}
      data-slot="combobox"
      data-size={size}
      data-open={open ? 'true' : undefined}
      data-multiple={multiple ? 'true' : undefined}
      data-disabled={isDisabled ? 'true' : undefined}
      data-invalid={field.invalid ? 'true' : undefined}
      className={cx('may-combobox', fullWidth && 'may-combobox--full', className)}
    >
      <div className="may-combobox__control">
        {multiple &&
          chosen.map((option) => (
            <span key={option.value} className="may-combobox__tag">
              <span className="may-combobox__tag-label">{option.label}</span>
              <button
                type="button"
                className="may-combobox__tag-remove may-hoverable"
                aria-label={`Remove ${option.label}`}
                disabled={isDisabled}
                onClick={() => commit(selected.filter((v) => v !== option.value))}
              >
                <IoClose aria-hidden focusable="false" />
              </button>
            </span>
          ))}

        <input
          ref={inputRef}
          id={autoId}
          className="may-combobox__input"
          role="combobox"
          type="text"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={mounted ? listId : undefined}
          aria-activedescendant={
            open && matches[active] ? `${autoId}-opt-${matches[active]!.value}` : undefined
          }
          aria-autocomplete={searchable ? 'list' : 'none'}
          aria-label={ariaLabel}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field['aria-describedby']}
          aria-required={field.required || undefined}
          disabled={isDisabled}
          readOnly={!searchable}
          placeholder={chosen.length === 0 ? placeholder : undefined}
          value={inputValue}
          onChange={(event) => {
            if (!searchable) return
            setQuery(event.target.value)
            setActive(0)
            if (!open) setOpen(true)
          }}
          onFocus={() => !isDisabled && setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {showClear && (
          <button
            type="button"
            className="may-combobox__clear may-hoverable"
            aria-label="Clear selection"
            onClick={() => {
              commit([])
              setQuery('')
              inputRef.current?.focus()
            }}
          >
            <IoClose aria-hidden focusable="false" />
          </button>
        )}

        <IoChevronDown className="may-combobox__chevron" aria-hidden focusable="false" />
      </div>

      {/*
       * One hidden input per value: FormData.getAll(name) is how a multi-value
       * field is read, and a single comma-joined string would make the consumer
       * parse it back out.
       */}
      {name !== undefined &&
        selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}

      {mounted && (
        <div
          ref={popupRef}
          className="may-combobox__popup"
          data-state={open ? 'open' : 'closed'}
          style={
            position
              ? // Physical left/top: placement runs in viewport coordinates, and an
                // inset-inline-start would resolve to `right` under RTL and stretch
                // the popup between the two. Same reason Popover uses them.
                { left: position.x, top: position.y, minWidth: position.width }
              : { visibility: 'hidden' }
          }
        >
          <ul id={listId} role="listbox" aria-multiselectable={multiple || undefined} className="may-combobox__list">
            {matches.length === 0 && (
              <li className="may-combobox__empty" role="presentation">
                {emptyLabel}
              </li>
            )}
            {groups.map((group, gi) => (
              <li key={group.heading ?? `g${gi}`} role="presentation">
                {group.heading && <span className="may-combobox__heading">{group.heading}</span>}
                <ul role="group" aria-label={group.heading} className="may-combobox__group">
                  {group.rows.map((option) => {
                    flatIndex += 1
                    const isActive = flatIndex === active
                    const isSelected = selected.includes(option.value)
                    return (
                      <li
                        key={option.value}
                        id={`${autoId}-opt-${option.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        data-active={isActive ? 'true' : undefined}
                        className="may-combobox__option may-hoverable"
                        // pointerdown, not click: the popup must not be
                        // dismissed by the outside-press handler first.
                        onPointerDown={(event) => {
                          event.preventDefault()
                          toggleValue(option)
                        }}
                        onPointerEnter={() => setActive(matches.indexOf(option))}
                      >
                        {renderOption ? (
                          renderOption(option, { selected: isSelected, active: isActive })
                        ) : (
                          <>
                            {option.icon && (
                              <span className="may-combobox__icon" aria-hidden>
                                {option.icon}
                              </span>
                            )}
                            <span className="may-combobox__text">
                              <span className="may-combobox__label">{option.label}</span>
                              {option.description && (
                                <span className="may-combobox__description">{option.description}</span>
                              )}
                            </span>
                            {isSelected && (
                              <IoCheckmark className="may-combobox__check" aria-hidden focusable="false" />
                            )}
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
