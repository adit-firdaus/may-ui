import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { createContext, forwardRef, useContext, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useFieldControl } from '../Field/Field'
import { useAutoId } from '../../utils/useId'
import type { MaySize } from '../../types'

/** No `xs`: the dot would fall under the 44px touch target it has to fill. */
export type RadioSize = Exclude<MaySize, 'xs'>

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  select: (value: string) => void
  size: RadioSize
  disabled: boolean
  invalid: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  children?: ReactNode
  /** Shared `name` for the radios. Generated when omitted. */
  name?: string
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** @default 'md' */
  size?: RadioSize
  /** Disables every radio in the group. */
  disabled?: boolean
  /** Mark the whole group invalid. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
}

/**
 * A set of mutually exclusive choices.
 *
 * The group owns the name, the selection, the size and the disabled/invalid
 * state, so a `Radio` inside it carries nothing but its own value. Arrow-key
 * roving comes free: the radios share a `name`, which is all the browser needs
 * to treat them as one tab stop and move the selection with the arrow keys.
 *
 * A surrounding `<Field>` supplies `disabled`, `invalid` and the id of its
 * message. It deliberately does **not** supply the group's id: `<label for>`
 * only names labelable elements, and a `role="radiogroup"` div is not one — so
 * give the group an `aria-label` (or a heading it points `aria-labelledby` at)
 * when it needs a name of its own.
 */
export function RadioGroup({
  children,
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  size = 'md',
  disabled,
  invalid,
  className,
  'aria-describedby': describedBy,
  ...rest
}: RadioGroupProps) {
  const field = useFieldControl({ invalid, disabled, 'aria-describedby': describedBy })
  const groupName = useAutoId(name)
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal
  const isDisabled = Boolean(field.disabled)

  const context = useMemo<RadioGroupContextValue>(
    () => ({
      name: groupName,
      value: current,
      select: (next) => {
        if (value === undefined) setInternal(next)
        onValueChange?.(next)
      },
      size,
      disabled: isDisabled,
      invalid: field.invalid,
    }),
    [groupName, current, value, onValueChange, size, isDisabled, field.invalid],
  )

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        {...rest}
        role="radiogroup"
        data-slot="radio-group"
        data-size={size}
        data-orientation={orientation}
        data-invalid={field.invalid ? 'true' : undefined}
        aria-disabled={isDisabled || undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field['aria-describedby']}
        className={cx('may-radio-group', className)}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children' | 'value'> {
  /** The value this radio contributes to its group. */
  value: string
  /** Label text beside the dot. */
  children?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  /** Overrides the group's size. */
  size?: RadioSize
  /** Overrides the group's invalid state. */
  invalid?: boolean
}

/**
 * One choice.
 *
 * Inside a `RadioGroup` everything but `value` comes from context; outside one
 * it falls back to the native props, so a radio still works in a plain form.
 * The dot scales in from nothing on the bouncy spring, overshooting its resting
 * size before settling — the same overshoot the press feedback uses.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    value,
    children,
    description,
    size,
    invalid,
    onChange,
    checked,
    defaultChecked,
    disabled,
    name,
    className,
    style,
    ...rest
  },
  ref,
) {
  const group = useContext(RadioGroupContext)
  const isDisabled = disabled ?? group?.disabled ?? false
  const isInvalid = invalid ?? group?.invalid ?? false
  const { pressProps } = usePressFeedback(isDisabled)

  // Grouped and controlled radios know their state; a bare uncontrolled one
  // does not — a sibling being picked deselects it without firing an event
  // here. That is why the visuals hang off the input's own `:checked` rather
  // than off this attribute, which exists for tests and consumer styling.
  const isChecked = group ? group.value === value : checked

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) group?.select(value)
    onChange?.(event)
  }

  return (
    <label
      {...pressProps}
      data-slot="radio"
      data-size={size ?? group?.size ?? 'md'}
      data-checked={isChecked ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      /* aria-disabled, not just the input's `disabled`: base.css gates its
       * shared hover highlight on exactly this attribute. */
      aria-disabled={isDisabled || undefined}
      className={cx('may-radio', 'may-pressable', 'may-hoverable', className)}
      style={style}
    >
      <input
        {...rest}
        ref={ref}
        type="radio"
        className="may-radio__input may-sr-only"
        name={name ?? group?.name}
        value={value}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
        {...(group || checked !== undefined ? { checked: Boolean(isChecked) } : { defaultChecked })}
      />
      <span className="may-radio__ring">
        <span className="may-radio__dot" aria-hidden />
      </span>
      {(children != null || description != null) && (
        <span className="may-radio__text">
          {children != null && <span className="may-radio__label">{children}</span>}
          {description != null && <span className="may-radio__description">{description}</span>}
        </span>
      )}
    </label>
  )
})
