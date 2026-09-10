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
import type { MaySize } from '../../types'
import './SearchBar.css'

export type SearchBarSize = Exclude<MaySize, 'xs'>

/**
 * `auto` is iOS: Cancel arrives on focus and leaves on blur — but stays while
 * there is still text, because that is the thing there is left to cancel.
 * `always` is for a screen whose whole purpose is the search. `never` drops the
 * affordance for a bar that filters in place and never takes over the view.
 */
export type SearchBarCancel = 'auto' | 'always' | 'never'

export interface SearchBarProps
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
  /** Fired after Cancel has cleared the field and dismissed the keyboard. */
  onCancel?: () => void
  /** @default 'md' */
  size?: SearchBarSize
  /** @default 'auto' */
  showCancel?: SearchBarCancel
  /** @default 'Cancel' */
  cancelLabel?: string
  /** Accessible name for the clear button. @default 'Clear search' */
  clearLabel?: string
  /**
   * Where the magnifier and placeholder rest while the bar is idle.
   * `center` is the list-header look — they sit in the middle of the pill and
   * travel to the leading edge as the bar wakes up. `leading` pins them there.
   * @default 'center'
   */
  align?: 'center' | 'leading'
  /**
   * Class for the outer band. `className` lands on the `<input>`, matching
   * `SearchField` — both extend the input's own attributes, so that is where
   * an unqualified `className` has to go.
   */
  wrapperClassName?: string
}

/** Point both the forwarded ref and our own at the same node. */
function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The search bar that sits at the head of a list.
 *
 * Not a wrapper around `SearchField`, and the difference is worth stating.
 * `SearchField` is an adaptive form control: it sizes to its container, wires
 * into `Field` for labels and validation, and can appear anywhere a text input
 * can. A SearchBar is a *place* — the full-width band above a list, which owns
 * the whole row it lives in, has no label because the placeholder is the
 * label, and controls a Cancel button that takes over the row on focus. Making
 * one adapt into the other would mean SearchField growing a mode for every
 * behaviour below; the pill they share is a dozen lines of fill and radius.
 *
 * Two motions carry it, and both are the reason it reads as iOS rather than as
 * a rounded input:
 *
 *   The lead travels. While the bar is idle the magnifier and placeholder are
 *   centred in the pill; the moment it takes focus they slide to the leading
 *   edge on `--may-spring-snappy`, out of the way of the caret. This is the
 *   part a real placeholder cannot do — the glyph has to travel *with* the
 *   text — so the visible placeholder is drawn by an `aria-hidden` span while
 *   the real one stays on the input, transparent, for assistive technology.
 *
 *   Cancel slides in from the trailing edge and pushes the pill narrower.
 *   Its width is measured rather than guessed: `width: 0 → auto` does not
 *   interpolate, and every CSS-only substitute either stalls or refuses to
 *   spring. One ResizeObserver gives an exact width that a spring can reach,
 *   and it survives late-loading fonts and localised labels.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value,
    defaultValue,
    onValueChange,
    onSearch,
    onCancel,
    size = 'md',
    showCancel = 'auto',
    cancelLabel = 'Cancel',
    clearLabel = 'Clear search',
    align = 'center',
    wrapperClassName,
    className,
    placeholder = 'Search',
    disabled,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref,
) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const [cancelWidth, setCancelWidth] = useState(0)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  const current = value ?? internal
  const hasValue = current.length > 0

  const rendersCancel = showCancel !== 'never'
  const cancelIn = showCancel === 'always' || (showCancel === 'auto' && (focused || hasValue))
  // The lead only rests in the middle of an empty, untouched bar.
  const lead = align === 'leading' || focused || hasValue ? 'leading' : 'center'

  const clearPress = usePressFeedback(!hasValue || disabled)
  const cancelPress = usePressFeedback(disabled)

  useIsomorphicLayoutEffect(() => {
    const el = cancelRef.current
    if (!el) return
    const measure = () => setCancelWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [rendersCancel, cancelLabel, size])

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
    if (event.key === 'Escape') {
      if (hasValue) clear()
      else if (rendersCancel) cancel()
    }
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

  const widthVar = { '--may-search-bar-cancel-w': `${cancelWidth}px` } as CSSProperties

  return (
    <div
      data-slot="search-bar"
      data-size={size}
      data-lead={lead}
      data-cancel={cancelIn ? 'true' : undefined}
      data-filled={hasValue ? 'true' : undefined}
      data-focused={focused ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-search-bar', wrapperClassName)}
      style={{ ...widthVar, ...style }}
    >
      <div className="may-search-bar__field">
        <span className="may-search-bar__lead" aria-hidden>
          <svg className="may-search-bar__glyph" viewBox="0 0 16 16" focusable="false">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M10.6 10.6L14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <span className="may-search-bar__placeholder">{placeholder}</span>
        </span>

        <input
          {...rest}
          ref={(node) => {
            inputRef.current = node
            assignRef(ref, node)
          }}
          type="search"
          value={current}
          /* Kept on the input and painted transparent, so the accessible name
           * is the real placeholder rather than a decorative span. */
          placeholder={placeholder}
          disabled={disabled}
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
          className={cx('may-search-bar__control', className)}
        />

        <span className="may-search-bar__clear-slot" data-visible={hasValue ? 'true' : undefined}>
          <button
            {...clearPress.pressProps}
            type="button"
            /* Disabled rather than unmounted: an unmounted button cannot
             * animate out, and a disabled one is already out of the tab order. */
            disabled={!hasValue || disabled}
            aria-hidden={!hasValue || undefined}
            aria-label={clearLabel}
            onMouseDown={keepFocus}
            onClick={clear}
            className="may-search-bar__clear may-pressable may-hoverable"
          >
            <svg viewBox="0 0 20 20" aria-hidden focusable="false">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              />
            </svg>
          </button>
        </span>
      </div>

      {rendersCancel && (
        <div className="may-search-bar__cancel-slot">
          <button
            {...cancelPress.pressProps}
            ref={cancelRef}
            type="button"
            /* Out of the tab order while it is off-screen; a focus ring on a
             * button nobody can see is a dead stop for keyboard users. */
            tabIndex={cancelIn ? undefined : -1}
            disabled={disabled}
            onMouseDown={keepFocus}
            onClick={cancel}
            className="may-search-bar__cancel may-pressable may-hoverable"
          >
            {cancelLabel}
          </button>
        </div>
      )}
    </div>
  )
})
