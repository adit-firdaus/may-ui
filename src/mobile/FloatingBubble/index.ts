import componentCss from './FloatingBubble.css?inline'
import fabCss from '../../components/Fab/Fab.css?inline'
import { FloatingBubble as FloatingBubbleBase } from './FloatingBubble'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('FloatingBubble', componentCss)
const fabStyle = /*#__PURE__*/ mayStyleSheet('Fab', fabCss)
const componentStyles = [fabStyle, componentStyle] as const

export const FloatingBubble = /*#__PURE__*/ mayStyled('FloatingBubble', FloatingBubbleBase, componentStyles)
export type { FloatingBubbleProps, BubbleEdge } from './FloatingBubble'
