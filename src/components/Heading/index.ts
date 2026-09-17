import componentCss from './Heading.css?inline'
import textCss from '../Text/Text.css?inline'
import { Heading as HeadingBase } from './Heading'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Heading', componentCss)
const textStyle = /*#__PURE__*/ mayStyleSheet('Text', textCss)
const componentStyles = [textStyle, componentStyle] as const

export const Heading = /*#__PURE__*/ mayStyled('Heading', HeadingBase, componentStyles)
export type { HeadingProps, HeadingLevel } from './Heading'
