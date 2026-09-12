import componentCss from './ButtonGroup.css?inline'
import { ButtonGroup as ButtonGroupBase } from './ButtonGroup'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('ButtonGroup', componentCss)
const componentStyles = [componentStyle] as const

export const ButtonGroup = withMayStyles('ButtonGroup', ButtonGroupBase, componentStyles)
export type { ButtonGroupProps } from './ButtonGroup'
