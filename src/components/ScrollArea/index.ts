import componentCss from './ScrollArea.css?inline'
import { ScrollArea as ScrollAreaBase } from './ScrollArea'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('ScrollArea', componentCss)
const componentStyles = [componentStyle] as const

export const ScrollArea = withMayStyles('ScrollArea', ScrollAreaBase, componentStyles)
export type { ScrollAreaProps, ScrollAxis } from './ScrollArea'
