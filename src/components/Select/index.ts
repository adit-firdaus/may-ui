import componentCss from './Select.css?inline'
import { Select as SelectBase } from './Select'
import { mayStyled } from '../../styles/runtime'

export const Select = /*#__PURE__*/ mayStyled('Select', SelectBase, componentCss)
export type { SelectProps, SelectOption } from './Select'
