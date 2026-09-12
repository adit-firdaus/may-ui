import componentCss from './Field.css?inline'
import { Field as FieldBase } from './Field'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Field', componentCss)
const componentStyles = [componentStyle] as const

export const Field = withMayStyles('Field', FieldBase, componentStyles)
export { useFieldContext, useFieldControl } from './Field'
export type { FieldProps, FieldContextValue, FieldControlOwnProps } from './Field'
