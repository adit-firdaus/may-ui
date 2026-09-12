import componentCss from './SwipeAction.css?inline'
import { SwipeAction as SwipeActionBase } from './SwipeAction'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SwipeAction', componentCss)
const componentStyles = [componentStyle] as const

export const SwipeAction = withMayStyles('SwipeAction', SwipeActionBase, componentStyles)
export type { SwipeActionProps, SwipeActionItem, SwipeSide } from './SwipeAction'
