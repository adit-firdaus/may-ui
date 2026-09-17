import componentCss from './Textarea.css?inline'
import { Textarea as TextareaBase } from './Textarea'
import { mayStyled } from '../../styles/runtime'

export const Textarea = /*#__PURE__*/ mayStyled('Textarea', TextareaBase, componentCss)
export type { TextareaProps, TextareaSize } from './Textarea'
