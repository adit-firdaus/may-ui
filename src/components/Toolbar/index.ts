import componentCss from './Toolbar.css?inline'
import { Toolbar as ToolbarBase, ToolbarSpacer as ToolbarSpacerBase } from './Toolbar'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Toolbar', componentCss)
const componentStyles = [componentStyle] as const

export const Toolbar = /*#__PURE__*/ mayStyled('Toolbar', ToolbarBase, componentStyles)
export const ToolbarSpacer = /*#__PURE__*/ mayStyled('ToolbarSpacer', ToolbarSpacerBase, componentStyles)
export type { ToolbarProps } from './Toolbar'
