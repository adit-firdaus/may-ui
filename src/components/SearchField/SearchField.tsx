import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
} from 'react'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useFieldControl } from '../Field/Field'
import { IoCloseCircle, IoSearch } from 'react-icons/io5'
import type { MaySize } from '../../types'

export type SearchFieldSize = Exclude<MaySize, 'xs'>

export interface SearchFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'value' | 'defaultValue' | 'prefix'
  > {
  /** Controlled value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter, or the search key on a software keyboard. */
  onSearch?: (value: string) => void
  /** @default 'md' */
  size?: SearchFieldSize
  /** Show a Cancel button that slides in while the field is active. */
  cancelable?: boolean
  /** @default 'Cancel' */
  cancelLabel?: string
  /** Called after Cancel has cleared and dismissed the field. */
  onCancel?: () => void
  /** Accessible name for the clear button. @default 'Clear search' */
  clearLabel?: string
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  fullWidth?: boolean
  /** Class name for the outer row; `className` lands on the `<input>` itself. */
  wrapperClassName?: string
}

/** Point both the forwarded ref and our own at the same node. */
function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The iOS search bar.
 *
 * A pill of fill with a magnifier in front of the text, a clear glyph that pops
 * in the moment there is something to clear, and — when `cancelable` — a Cancel
 * button that slides in from the trailing edge as the field becomes active.
 *
 * Cancel's width is measured rather than guessed. `width: 0 → auto` does not
 * interpolate, and every CSS-only workaround (a `max-width` that stalls, an
 * `fr` track that clamps under intrinsic sizing) either stutters or refuses to
 * spring; one ResizeObserver on the button gives an exact, localisable width
 * that the slide can actually animate to.
 *
 * Both buttons keep their presence animation on a wrapper and their press
 * animation on the button, because `may-pressable` owns `transform` and a
 * second transform on the same element would silently win.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    value,
    defaultValue,
    onValueChange,
    onSearch,
    size = 'md',
    cancelable = false,
    cancelLabel = 'Cancel',
    onCancel,
    clearLabel = 'Clear search',
    invalid,
    fullWidth = false,
    wrapperClassName,
    className,
    placeholder = 'Search',
    id,
    required,
    disabled,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    'aria-describedby': describedBy,
    style,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, required, disabled, 'aria-describedby': describedBy })
  const [internal, setInternal] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const [cancelWidth, setCancelWidth] = useState(0)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  const current = value ?? internal
  const hasValue = current.length > 0
  // iOS keeps Cancel out while there is still text to cancel, not only while focused.
  const showCancel = cancelable && (focused || hasValue)

  const clearPress = usePressFeedback(!hasValue)
  const cancelPress = usePressFeedback(field.disabled)

  useIsomorphicLayoutEffect(() => {
    const el = cancelRef.current
    if (!el) return
    const measure = () => setCancelWidth(el.getBoundingClientRect().width)
    measure()
    // Fonts land late and localisation changes the label; both change the width.
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cancelable, cancelLabel, size])

  const commit = (next: string) => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value)
    onChange?.(event)
  }

  const clear = () => {
    commit('')
    // Native keeps the keyboard up after a clear — the intent is to retype.
    inputRef.current?.focus()
  }

  const cancel = () => {
    commit('')
    inputRef.current?.blur()
    setFocused(false)
    onCancel?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSearch?.(current)
    // Escape empties the field before it does anything else, as macOS does.
    if (event.key === 'Escape' && hasValue) clear()
    onKeyDown?.(event)
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    onBlur?.(event)
  }

  /* Pressing a trailing button steals focus from the input, which collapses the
   * very row the button lives in — so the press lands on nothing. Suppressing
   * the default mousedown keeps focus put until the click resolves. */
  const keepFocus = (event: { preventDefault: () => void }) => event.preventDefault()

  const cancelVar = { '--may-search-cancel-w': `${cancelWidth}px` } as CSSProperties

  return (
    <div
      data-slot="search-field"
      data-size={size}
      data-cancel={showCancel ? 'true' : undefined}
      data-invalid={field.invalid ? 'true' : undefined}
      data-disabled={field.disabled ? 'true' : undefined}
      className={cx('may-search', fullWidth && 'may-search--full', wrapperClassName)}
      style={{ ...cancelVar, ...style }}
    >
      <div className="may-search__field">
        <IoSearch className="may-search__glyph" aria-hidden focusable="false" />

        <input
          {...rest}
          ref={(node) => {
            inputRef.current = node
            assignRef(ref, node)
          }}
          type="search"
          id={field.id}
          value={current}
          placeholder={placeholder}
          required={field.required}
          disabled={field.disabled}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field['aria-describedby']}
          /* A search field is a query, not prose: no autocorrect, no
           * capitalisation, and a keyboard whose return key says Search. */
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cx('may-search__control', className)}
        />

        <span className="may-search__clear-slot" data-visible={hasValue ? 'true' : undefined}>
          <button
            {...clearPress.pressProps}
            type="button"
            /* Disabled rather than unmounted: an unmounted button cannot animate
             * out, and a disabled one is already out of the tab order. */
            disabled={!hasValue || field.disabled}
            aria-hidden={!hasValue || undefined}
            aria-label={clearLabel}
            onMouseDown={keepFocus}
            onClick={clear}
            className="may-search__clear may-pressable may-hoverable"
          >
            {/* A filled disc with the X knocked out of it — iOS's clear glyph. */}
            <IoCloseCircle aria-hidden focusable="false" />
          </button>
        </span>
      </div>

      {cancelable && (
        <div className="may-search__cancel-slot">
          <button
            {...cancelPress.pressProps}
            ref={cancelRef}
            type="button"
            tabIndex={showCancel ? undefined : -1}
            disabled={field.disabled}
            onMouseDown={keepFocus}
            onClick={cancel}
            className="may-search__cancel may-pressable may-hoverable"
          >
            {cancelLabel}
          </button>
        </div>
      )}
    </div>
  )
})
