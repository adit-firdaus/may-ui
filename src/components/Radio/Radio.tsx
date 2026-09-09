import type { InputHTMLAttributes, ReactNode } from 'react'
import { createContext, forwardRef, useContext, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { useAutoId } from '../../utils/useId'
import type { MaySize } from '../../types'
import './Radio.css'

interface RadioGroupContextValue {
  name: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size: MaySize
  disabled: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** The value submitted when this option is selected. */
  value: string
  children?: ReactNode
  description?: ReactNode
  /** @default 'md' */
  size?: MaySize
}

/** One option. Use inside a `<RadioGroup>`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, children, description, size, className, disabled, id, name, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext)
  const autoId = useAutoId(id)
  const descriptionId = `${autoId}-description`
  const resolvedSize = size ?? group?.size ?? 'md'
  const isDisabled = disabled ?? group?.disabled ?? false

  const controlled = group?.value !== undefined
  return (
    <div
      className={cx(
        'may-radio',
        `may-radio--${resolvedSize}`,
        isDisabled && 'may-radio--disabled',
        className,
      )}
    >
      <input
        {...rest}
        ref={ref}
        type="radio"
        id={autoId}
        value={value}
        name={name ?? group?.name}
        disabled={isDisabled}
        className="may-radio__input"
        aria-describedby={description ? descriptionId : undefined}
        {...(controlled
          ? { checked: group.value === value }
          : group?.defaultValue !== undefined
            ? { defaultChecked: group.defaultValue === value }
            : {})}
        onChange={(event) => {
          rest.onChange?.(event)
          group?.onValueChange?.(value)
        }}
      />
      <span className="may-radio__circle" aria-hidden>
        <span className="may-radio__dot" />
      </span>
      {(children || description) && (
        <span className="may-radio__text">
          {children && (
            <label className="may-radio__label" htmlFor={autoId}>
              {children}
            </label>
          )}
          {description && (
            <span className="may-radio__description" id={descriptionId}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  )
})

export interface RadioGroupProps {
  children?: ReactNode
  /** Shared `name` for the options. Generated when omitted. */
  name?: string
  /** Controlled selected value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Fires with the newly selected option's value. */
  onValueChange?: (value: string) => void
  /** @default 'md' */
  size?: MaySize
  /** @default false */
  disabled?: boolean
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** Names the group for assistive tech when there is no visible label. */
  'aria-label'?: string
  /** Points at the id of a visible label, e.g. a `<Field>` label. */
  'aria-labelledby'?: string
  className?: string
}

/** Radio options that behave as one control. */
export function RadioGroup({
  children,
  name,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  disabled = false,
  orientation = 'vertical',
  className,
  ...rest
}: RadioGroupProps) {
  const autoName = useAutoId(name)
  const ctx = useMemo<RadioGroupContextValue>(
    () => ({ name: autoName, value, defaultValue, onValueChange, size, disabled }),
    [autoName, value, defaultValue, onValueChange, size, disabled],
  )

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        {...rest}
        role="radiogroup"
        className={cx('may-radio-group', `may-radio-group--${orientation}`, className)}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}
