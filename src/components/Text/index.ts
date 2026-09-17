import componentCss from './Text.css?inline'
import { Text as TextBase } from './Text'
import { mayStyled } from '../../styles/runtime'

export const Text = /*#__PURE__*/ mayStyled('Text', TextBase, componentCss)
export type { TextProps, TextTone, TextWeight, TextAlign } from './Text'
