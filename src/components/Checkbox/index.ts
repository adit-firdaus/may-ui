import componentCss from './Checkbox.css?inline'
import { Checkbox as CheckboxBase } from './Checkbox'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Checkbox', componentCss)
const componentStyles = [componentStyle] as const

export const Checkbox = withMayStyles('Checkbox', CheckboxBase, componentStyles)
export type { CheckboxProps, CheckboxSize } from './Checkbox'
