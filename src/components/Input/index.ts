import componentCss from './Input.css?inline'
import { Input as InputBase } from './Input'
import { mayStyled } from '../../styles/runtime'

export const Input = /*#__PURE__*/ mayStyled('Input', InputBase, componentCss)
export type { InputProps, InputSize } from './Input'
