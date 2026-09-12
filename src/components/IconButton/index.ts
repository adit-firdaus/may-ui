import componentCss from './IconButton.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { IconButton as IconButtonBase } from './IconButton'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('IconButton', componentCss)
const buttonStyle = mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, componentStyle] as const

export const IconButton = withMayStyles('IconButton', IconButtonBase, componentStyles)
export type { IconButtonProps } from './IconButton'
