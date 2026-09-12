import componentCss from './Switch.css?inline'
import { Switch as SwitchBase } from './Switch'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Switch', componentCss)
const componentStyles = [componentStyle] as const

export const Switch = withMayStyles('Switch', SwitchBase, componentStyles)
export type { SwitchProps, SwitchSize } from './Switch'
