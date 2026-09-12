import type { ChangeEvent, ForwardedRef, TextareaHTMLAttributes } from 'react'
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/Field'
import type { MaySize } from '../../types'

export type TextareaSize = Exclude<MaySize, 'xs'>

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** @default 'md' */
  size?: TextareaSize
  /** Mark invalid explicitly. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  fullWidth?: boolean
  /** Visible rows, and the floor the field never shrinks below. @default 3 */
  rows?: number
  /** Allow the user to drag-resize. Forced to `none` while `autoGrow` is on. @default 'vertical' */
  resize?: 'none' | 'vertical' | 'both'
  /** Grow to fit the content instead of scrolling it — the Messages compose field. */
  autoGrow?: boolean
  /** Class name for the fill; `className` lands on the `<textarea>` itself. */
  wrapperClassName?: string
}

/** Point both the forwarded ref and our own at the same node. */
function assignRef<T>(ref: ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A multi-line text field.
 *
 * Same fill treatment as `Input` — no stroke, a sprung focus ring — plus the
 * one behaviour a plain `<textarea>` never gets right: `autoGrow`, which keeps
 * the whole draft visible instead of hiding it behind an internal scrollbar.
 *
 * Height is deliberately not transitioned. Growing is driven by measuring the
 * element after collapsing it, and a transition would animate away from the
 * height we just measured, so every keystroke would chase a moving target.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    rows = 3,
    resize = 'vertical',
    autoGrow = false,
    wrapperClassName,
    className,
    id,
    required,
    disabled,
    value,
    onChange,
    'aria-describedby': describedBy,
    style,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, required, disabled, 'aria-describedby': describedBy })
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const fit = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    if (!autoGrow) {
      el.style.height = ''
      return
    }
    /* Collapse before measuring: scrollHeight reports the *content* height only
     * while the element is not already taller than its content, so a field that
     * has grown once would otherwise never shrink again. */
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoGrow])

  // Covers the controlled case and the first paint with a defaultValue.
  useIsomorphicLayoutEffect(fit, [fit, value, rows])

  /* Re-wrapping changes the line count without changing the value, so a width
   * change has to re-measure too — a resized sheet is the common case. */
  useEffect(() => {
    if (!autoGrow || typeof ResizeObserver === 'undefined' || !wrapperRef.current) return
    const ro = new ResizeObserver(fit)
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [autoGrow, fit])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // The DOM value is already current here, so the uncontrolled case fits too.
    fit()
    onChange?.(event)
  }

  return (
    <div
      ref={wrapperRef}
      data-slot="textarea"
      data-size={size}
      data-resize={autoGrow ? 'none' : resize}
      data-autogrow={autoGrow ? 'true' : undefined}
      data-invalid={field.invalid ? 'true' : undefined}
      data-disabled={field.disabled ? 'true' : undefined}
      className={cx('may-textarea', fullWidth && 'may-textarea--full', wrapperClassName)}
      style={style}
    >
      <textarea
        {...rest}
        ref={(node) => {
          innerRef.current = node
          assignRef(ref, node)
        }}
        id={field.id}
        rows={rows}
        value={value}
        onChange={handleChange}
        required={field.required}
        disabled={field.disabled}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field['aria-describedby']}
        className={cx('may-textarea__control', className)}
      />
    </div>
  )
})
