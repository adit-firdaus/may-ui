import componentCss from './Stack.css?inline'
import { Stack as StackBase } from './Stack'
import { mayStyled } from '../../styles/runtime'

export const Stack = /*#__PURE__*/ mayStyled('Stack', StackBase, componentCss)
export type { StackProps, StackDirection, StackAlign, StackJustify } from './Stack'
