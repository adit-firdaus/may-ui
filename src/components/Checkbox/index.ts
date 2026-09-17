import componentCss from './Checkbox.css?inline'
import { Checkbox as CheckboxBase } from './Checkbox'
import { mayStyled } from '../../styles/runtime'

export const Checkbox = /*#__PURE__*/ mayStyled('Checkbox', CheckboxBase, componentCss)
export type { CheckboxProps, CheckboxSize } from './Checkbox'
