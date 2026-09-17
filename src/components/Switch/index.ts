import componentCss from './Switch.css?inline'
import { Switch as SwitchBase } from './Switch'
import { mayStyled } from '../../styles/runtime'

export const Switch = /*#__PURE__*/ mayStyled('Switch', SwitchBase, componentCss)
export type { SwitchProps, SwitchSize } from './Switch'
