import componentCss from './Label.css?inline'
import textCss from '../Text/Text.css?inline'
import { Label as LabelBase } from './Label'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Label', componentCss)
const textStyle = mayStyleSheet('Text', textCss)
const componentStyles = [textStyle, componentStyle] as const

export const Label = withMayStyles('Label', LabelBase, componentStyles)
export type { LabelProps } from './Label'
