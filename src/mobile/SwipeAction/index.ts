import componentCss from './SwipeAction.css?inline'
import { SwipeAction as SwipeActionBase } from './SwipeAction'
import { mayStyled } from '../../styles/runtime'

export const SwipeAction = /*#__PURE__*/ mayStyled('SwipeAction', SwipeActionBase, componentCss)
export type { SwipeActionProps, SwipeActionItem, SwipeSide } from './SwipeAction'
