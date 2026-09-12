import componentCss from './Input.css?inline'
import { Input as InputBase } from './Input'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Input', componentCss)
const componentStyles = [componentStyle] as const

export const Input = withMayStyles('Input', InputBase, componentStyles)
export type { InputProps, InputSize } from './Input'
