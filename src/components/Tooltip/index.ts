import componentCss from './Tooltip.css?inline'
import { Tooltip as TooltipBase } from './Tooltip'
import { mayStyled } from '../../styles/runtime'

export const Tooltip = /*#__PURE__*/ mayStyled('Tooltip', TooltipBase, componentCss)
export type { TooltipProps } from './Tooltip'
