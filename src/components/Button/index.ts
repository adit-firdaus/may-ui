import componentCss from './Button.css?inline'
import { Button as ButtonBase } from './Button'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Button', componentCss)
const componentStyles = [componentStyle] as const

export const Button = withMayStyles('Button', ButtonBase, componentStyles)
export type { ButtonProps, ButtonVariant } from './Button'
