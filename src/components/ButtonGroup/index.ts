import componentCss from './ButtonGroup.css?inline'
import { ButtonGroup as ButtonGroupBase } from './ButtonGroup'
import { mayStyled } from '../../styles/runtime'

export const ButtonGroup = /*#__PURE__*/ mayStyled('ButtonGroup', ButtonGroupBase, componentCss)
export type { ButtonGroupProps } from './ButtonGroup'
