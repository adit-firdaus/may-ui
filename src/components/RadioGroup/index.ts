import componentCss from './RadioGroup.css?inline'
import { RadioGroup as RadioGroupBase, Radio as RadioBase } from './RadioGroup'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('RadioGroup', componentCss)
const componentStyles = [componentStyle] as const

export const RadioGroup = withMayStyles('RadioGroup', RadioGroupBase, componentStyles)
export const Radio = withMayStyles('Radio', RadioBase, componentStyles)
export type { RadioGroupProps, RadioProps, RadioSize } from './RadioGroup'
