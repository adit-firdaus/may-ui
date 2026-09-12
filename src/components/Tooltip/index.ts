import componentCss from './Tooltip.css?inline'
import { Tooltip as TooltipBase } from './Tooltip'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Tooltip', componentCss)
const componentStyles = [componentStyle] as const

export const Tooltip = withMayStyles('Tooltip', TooltipBase, componentStyles)
export type { TooltipProps } from './Tooltip'
