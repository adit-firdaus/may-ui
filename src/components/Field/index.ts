import componentCss from './Field.css?inline'
import { Field as FieldBase } from './Field'
import { mayStyled } from '../../styles/runtime'

export const Field = /*#__PURE__*/ mayStyled('Field', FieldBase, componentCss)
export { useFieldContext, useFieldControl } from './Field'
export type { FieldProps, FieldContextValue, FieldControlOwnProps } from './Field'
