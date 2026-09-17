import componentCss from './RadioGroup.css?inline'
import { RadioGroup as RadioGroupBase, Radio as RadioBase } from './RadioGroup'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('RadioGroup', componentCss)
const componentStyles = [componentStyle] as const

export const RadioGroup = /*#__PURE__*/ mayStyled('RadioGroup', RadioGroupBase, componentStyles)
export const Radio = /*#__PURE__*/ mayStyled('Radio', RadioBase, componentStyles)
export type { RadioGroupProps, RadioProps, RadioSize } from './RadioGroup'
