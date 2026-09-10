import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import type { MaySize } from '../../types'
import './Selector.css'

export interface SelectorOption {
  /** Primary line. */
  label: ReactNode
  value: string
  /** Second line under the label. `card` only — a chip has no room for one. */
  description?: ReactNode
  /** Leading glyph: an inline SVG, an emoji, an `IconTile`. */
  icon?: ReactNode
  disabled?: boolean
}

/** `card` is the tappable tile; `chip` is the pill that wraps in a row. */
export type SelectorVariant = 'card' | 'chip'
export type SelectorSize = Exclude<MaySize, 'xs'>
/** A fixed column count, or `'auto'` to let items wrap at their natural width. */
export type SelectorColumns = number | 'auto'

interface SelectorBaseProps {
  options: SelectorOption[]
  /** @default 'card' */
  variant?: SelectorVariant
  /** @default 'md' */
  size?: SelectorSize
  /**
   * Grid columns. `1` stacks them into a list. `'auto'` drops the grid and
   * lets items wrap at their own width, which is what a row of chips wants.
   * @default 2 for cards, 'auto' for chips
   */
  columns?: SelectorColumns
  /** Disables every option at once. */
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

interface SelectorSingleProps {
  /** @default false */
  multiple?: false
  value?: string
  defaultValue?: string
  onChange?: (value: string, option: SelectorOption) => void
}

interface SelectorMultipleProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[], option: SelectorOption) => void
}

/**
 * Written as a union rather than as `string | string[]` on one shape, so the
 * value a consumer receives is decided by the `multiple` flag they already
 * passed — no runtime `Array.isArray` at the call site, no `as string`.
 */
export type SelectorProps =
  | (SelectorBaseProps & SelectorSingleProps)
  | (SelectorBaseProps & SelectorMultipleProps)

const asList = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

/**
 * A set of choices laid out as cards or chips.
 *
 * The whole point of this shape over a `Select` is that every option is
 * visible and one tap away, so it is worth spending the screen only when the
 * options are few and the choice is the task — Focus modes, an AirDrop
 * visibility setting, the topics on a first-run screen.
 *
 * Selection is a tinted fill and a checkmark, never a stroke. The two variants
 * animate that arrival differently on purpose: a card's check fades up in
 * place so a grid never reflows, while a chip's check slides out from the
 * leading edge and *widens the chip*, which is the motion iOS uses and the
 * reason a chip row feels physical rather than repainted.
 */
export function Selector(props: SelectorProps) {
  const {
    options,
    variant = 'card',
    size = 'md',
    disabled = false,
    className,
  } = props

  const multiple = props.multiple === true
  const columns = props.columns ?? (variant === 'chip' ? 'auto' : 2)

  const controlled = props.value !== undefined
  const [internal, setInternal] = useState<string[]>(() => asList(props.defaultValue))
  const selected = controlled ? asList(props.value) : internal

  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const emit = (next: string[], option: SelectorOption) => {
    if (!controlled) setInternal(next)
    if (props.multiple) props.onChange?.(next, option)
    else props.onChange?.(next[0] ?? '', option)
  }

  const choose = (option: SelectorOption) => {
    if (disabled || option.disabled) return

    if (props.multiple) {
      emit(
        selected.includes(option.value)
          ? selected.filter((v) => v !== option.value)
          : [...selected, option.value],
        option,
      )
      return
    }

    /*
     * Single mode is radio semantics, and a radio has no "off". Re-tapping the
     * active option therefore does nothing — the toggle-off signal is swallowed
     * here rather than emitted as an empty selection, which would read as the
     * tap having *undone* the choice and leave the control in a state it has no
     * way to show or to recover from without a tap somewhere else.
     */
    if (selected[0] === option.value) return
    emit([option.value], option)
  }

  const selectedIndex = options.findIndex((o) => selected.includes(o.value))
  /* Roving tabindex: the group is one tab stop, and arrows move within it. With
   * nothing selected yet the first option a user could actually pick takes it. */
  const tabStop = selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled)

  /**
   * Radio-group keys. Multi-select is a set of independent toggle buttons, so
   * it keeps the natural tab order instead — arrows there would move focus and
   * selection together, which is exactly what a checkbox must not do.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (multiple || disabled || options.length === 0) return

    // Down/Up step a whole row, so a two-column grid reads as a grid rather
    // than as a list that happens to be folded.
    const row = typeof columns === 'number' ? Math.max(1, columns) : 1
    const delta =
      event.key === 'ArrowRight' ? 1
      : event.key === 'ArrowLeft' ? -1
      : event.key === 'ArrowDown' ? row
      : event.key === 'ArrowUp' ? -row
      : 0
    if (delta === 0) return
    event.preventDefault()

    const wrap = (i: number) => ((i % options.length) + options.length) % options.length
    const step = Math.sign(delta)
    let index = wrap(Math.max(0, selectedIndex) + delta)
    for (let n = 0; n < options.length && options[index]!.disabled; n++) {
      index = wrap(index + step)
    }
    const target = options[index]!
    if (target.disabled) return

    emit([target.value], target)
    buttons.current[index]?.focus()
  }

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={props['aria-label']}
      data-slot="selector"
      data-variant={variant}
      data-size={size}
      data-columns={typeof columns === 'number' ? 'fixed' : 'auto'}
      data-disabled={disabled ? 'true' : undefined}
      className={cx('may-selector', className)}
      style={
        typeof columns === 'number'
          ? ({ '--may-selector-cols': String(columns) } as CSSProperties)
          : undefined
      }
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <SelectorItem
          key={option.value}
          option={option}
          variant={variant}
          multiple={multiple}
          selected={selected.includes(option.value)}
          disabled={disabled || Boolean(option.disabled)}
          tabIndex={multiple ? undefined : index === tabStop ? 0 : -1}
          onSelect={() => choose(option)}
          register={(node) => {
            buttons.current[index] = node
          }}
        />
      ))}
    </div>
  )
}

interface SelectorItemProps {
  option: SelectorOption
  variant: SelectorVariant
  multiple: boolean
  selected: boolean
  disabled: boolean
  tabIndex?: number
  onSelect: () => void
  register: (node: HTMLButtonElement | null) => void
}

/**
 * One option. A real `<button>` — a div with an onClick is invisible to
 * keyboard and switch-access users, who have no way to focus or activate it.
 *
 * `usePressFeedback` is a hook, so each option has to be its own component;
 * that is the whole reason this exists separately rather than inline in the map.
 */
function SelectorItem({
  option,
  variant,
  multiple,
  selected,
  disabled,
  tabIndex,
  onSelect,
  register,
}: SelectorItemProps) {
  const { pressProps } = usePressFeedback(disabled)

  return (
    <button
      {...pressProps}
      ref={register}
      type="button"
      /* Radio semantics for one-of-many, toggle-button semantics for a set:
       * `aria-checked` promises a group where exactly one is on, which is a
       * lie in multi-select. */
      role={multiple ? undefined : 'radio'}
      aria-checked={multiple ? undefined : selected}
      aria-pressed={multiple ? selected : undefined}
      tabIndex={tabIndex}
      disabled={disabled}
      data-slot="selector-option"
      data-selected={selected ? 'true' : undefined}
      className="may-selector__option may-pressable may-hoverable"
      onClick={onSelect}
    >
      {option.icon && (
        <span className="may-selector__icon" aria-hidden>
          {option.icon}
        </span>
      )}
      <span className="may-selector__text">
        <span className="may-selector__label">{option.label}</span>
        {variant === 'card' && option.description && (
          <span className="may-selector__description">{option.description}</span>
        )}
      </span>
      {/* Always rendered, never conditionally mounted: an element that appears
          on selection cannot animate in, and in a card it would reflow the
          grid the instant it did. CSS reveals it. */}
      <span className="may-selector__check" aria-hidden>
        <svg viewBox="0 0 16 16" focusable="false">
          <path
            d="M3.5 8.4l3.1 3.1L12.5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  )
}
