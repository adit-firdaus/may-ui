import componentCss from './Stack.css?inline'
import { Stack as StackBase } from './Stack'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Stack', componentCss)
const componentStyles = [componentStyle] as const

export const Stack = withMayStyles('Stack', StackBase, componentStyles)
export type { StackProps, StackDirection, StackAlign, StackJustify } from './Stack'
