import componentCss from './Textarea.css?inline'
import { Textarea as TextareaBase } from './Textarea'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Textarea', componentCss)
const componentStyles = [componentStyle] as const

export const Textarea = withMayStyles('Textarea', TextareaBase, componentStyles)
export type { TextareaProps, TextareaSize } from './Textarea'
