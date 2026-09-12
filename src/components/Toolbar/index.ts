import componentCss from './Toolbar.css?inline'
import { Toolbar as ToolbarBase, ToolbarSpacer as ToolbarSpacerBase } from './Toolbar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Toolbar', componentCss)
const componentStyles = [componentStyle] as const

export const Toolbar = withMayStyles('Toolbar', ToolbarBase, componentStyles)
export const ToolbarSpacer = withMayStyles('ToolbarSpacer', ToolbarSpacerBase, componentStyles)
export type { ToolbarProps } from './Toolbar'
