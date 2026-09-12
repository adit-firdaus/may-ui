import componentCss from './Heading.css?inline'
import textCss from '../Text/Text.css?inline'
import { Heading as HeadingBase } from './Heading'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Heading', componentCss)
const textStyle = mayStyleSheet('Text', textCss)
const componentStyles = [textStyle, componentStyle] as const

export const Heading = withMayStyles('Heading', HeadingBase, componentStyles)
export type { HeadingProps, HeadingLevel } from './Heading'
