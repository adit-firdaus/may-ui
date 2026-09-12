import componentCss from './SafeArea.css?inline'
import { SafeArea as SafeAreaBase } from './SafeArea'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SafeArea', componentCss)
const componentStyles = [componentStyle] as const

export const SafeArea = withMayStyles('SafeArea', SafeAreaBase, componentStyles)
export type { SafeAreaProps, SafeAreaEdge } from './SafeArea'
