import componentCss from './Label.css?inline'
import textCss from '../Text/Text.css?inline'
import { Label as LabelBase } from './Label'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Label', componentCss)
const textStyle = /*#__PURE__*/ mayStyleSheet('Text', textCss)
const componentStyles = [textStyle, componentStyle] as const

export const Label = /*#__PURE__*/ mayStyled('Label', LabelBase, componentStyles)
export type { LabelProps } from './Label'
