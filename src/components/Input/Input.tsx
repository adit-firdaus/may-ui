import type { ForwardedRef, InputHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { forwardRef, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/Field'
import type { MaySize } from '../../types'

/** No `xs`: a 32px text field is under the touch target and unreadable on a phone. */
export type InputSize = Exclude<MaySize, 'xs'>

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** @default 'md' */
  size?: InputSize
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  /** Content pinned inside the leading edge — an icon, a currency symbol, a unit. */
  prefix?: ReactNode
  /** Content pinned inside the trailing edge. */
  suffix?: ReactNode
  fullWidth?: boolean
  /** Class name for the fill; `className` lands on the `<input>` itself. */
  wrapperClassName?: string
}

/** Point both the forwarded ref and our own at the same node. */
function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

/** Elements inside the fill that own their own clicks. */
const INTERACTIVE = 'button, a[href], input, select, textarea, [tabindex]'

/**
 * A single-line text field.
 *
 * It is a **fill**, not a box: the field reads as a field because it sits at a
 * different value from the surface behind it, never because a stroke encloses
 * it. Focus is announced by a ring drawn with `box-shadow`, which — unlike a
 * border — costs no layout and can therefore spring.
 *
 * Deliberately not `may-pressable`: a text field is not a button, and scaling
 * it under the finger would move the caret away from where it was aimed. The
 * fill's hover and focus response is the whole of its feedback.
 *
 * Type size lives on the wrapper rather than the `<input>` on purpose. base.css
 * raises every input to `max(16px, 1em)` so iOS never zooms the viewport on
 * focus, and `1em` there resolves against this wrapper — so the size prop still
 * drives the field's scale without fighting that rule.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    invalid,
    prefix,
    suffix,
    fullWidth = false,
    wrapperClassName,
    className,
    id,
    required,
    disabled,
    'aria-describedby': describedBy,
    style,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, required, disabled, 'aria-describedby': describedBy })
  const inputRef = useRef<HTMLInputElement | null>(null)

  /*
   * A native text field is one tap target: its padding and its unit label are
   * part of the field, not dead space beside it. Without this, clicking the
   * `$` or the right-hand gutter does nothing, which is the tell that the fill
   * is decoration wrapped around a smaller real control.
   */
  const focusFromChrome = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target === inputRef.current || target.closest(INTERACTIVE)) return
    // Keeps the current selection from collapsing before focus() runs.
    event.preventDefault()
    inputRef.current?.focus()
  }

  return (
    <div
      data-slot="input"
      data-size={size}
      data-invalid={field.invalid ? 'true' : undefined}
      data-disabled={field.disabled ? 'true' : undefined}
      className={cx('may-input', fullWidth && 'may-input--full', wrapperClassName)}
      style={style}
      onMouseDown={focusFromChrome}
    >
      {prefix != null && (
        <span className="may-input__affix" data-side="leading">
          {prefix}
        </span>
      )}

      <input
        {...rest}
        ref={(node) => {
          inputRef.current = node
          assignRef(ref, node)
        }}
        id={field.id}
        required={field.required}
        disabled={field.disabled}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field['aria-describedby']}
        className={cx('may-input__control', className)}
      />

      {suffix != null && (
        <span className="may-input__affix" data-side="trailing">
          {suffix}
        </span>
      )}
    </div>
  )
})
