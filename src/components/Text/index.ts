import componentCss from './Text.css?inline'
import { Text as TextBase } from './Text'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Text', componentCss)
const componentStyles = [componentStyle] as const

export const Text = withMayStyles('Text', TextBase, componentStyles)
export type { TextProps, TextTone, TextWeight, TextAlign } from './Text'
