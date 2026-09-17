import componentCss from './Button.css?inline'
import { Button as ButtonBase } from './Button'
import { mayStyled } from '../../styles/runtime'

export const Button = /*#__PURE__*/ mayStyled('Button', ButtonBase, componentCss)
export type { ButtonProps, ButtonVariant } from './Button'
