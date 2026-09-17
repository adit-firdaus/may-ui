import componentCss from './IconButton.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { IconButton as IconButtonBase } from './IconButton'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('IconButton', componentCss)
const buttonStyle = /*#__PURE__*/ mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, componentStyle] as const

export const IconButton = /*#__PURE__*/ mayStyled('IconButton', IconButtonBase, componentStyles)
export type { IconButtonProps } from './IconButton'
