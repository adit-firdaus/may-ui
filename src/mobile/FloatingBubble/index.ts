import componentCss from './FloatingBubble.css?inline'
import fabCss from '../../components/Fab/Fab.css?inline'
import { FloatingBubble as FloatingBubbleBase } from './FloatingBubble'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('FloatingBubble', componentCss)
const fabStyle = mayStyleSheet('Fab', fabCss)
const componentStyles = [fabStyle, componentStyle] as const

export const FloatingBubble = withMayStyles('FloatingBubble', FloatingBubbleBase, componentStyles)
export type { FloatingBubbleProps, BubbleEdge } from './FloatingBubble'
