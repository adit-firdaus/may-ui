import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { useFieldContext } from '../Field/Field'
import { useAutoId } from '../../utils/useId'
import type { MaySize } from '../../types'
import './Switch.css'

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  children?: ReactNode
  description?: ReactNode
  /** @default 'md' */
  size?: MaySize
  /** Put the label before the track instead of after. @default 'end' */
  labelPosition?: 'start' | 'end'
}

/**
 * An on/off toggle that applies immediately. For a choice that only takes
 * effect on submit, use `<Checkbox>` instead.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { children, description, size = 'md', labelPosition = 'end', className, disabled, id, ...rest },
  ref,
) {
  const field = useFieldContext()
  const autoId = useAutoId(id ?? field?.controlId)
  const descriptionId = `${autoId}-description`
  const isDisabled = disabled ?? field?.disabled ?? false

  return (
    <div
      className={cx(
        'may-switch',
        `may-switch--${size}`,
        `may-switch--label-${labelPosition}`,
        isDisabled && 'may-switch--disabled',
        className,
      )}
    >
      <span className="may-switch__control">
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          id={autoId}
          disabled={isDisabled}
          className="may-switch__input"
          aria-describedby={description ? descriptionId : field?.describedBy}
        />
        <span className="may-switch__track" aria-hidden>
          <span className="may-switch__thumb" />
        </span>
      </span>
      {(children || description) && (
        <span className="may-switch__text">
          {children && (
            <label className="may-switch__label" htmlFor={autoId}>
              {children}
            </label>
          )}
          {description && (
            <span className="may-switch__description" id={descriptionId}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  )
})
