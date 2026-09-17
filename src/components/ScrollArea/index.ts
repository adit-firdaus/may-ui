import componentCss from './ScrollArea.css?inline'
import { ScrollArea as ScrollAreaBase } from './ScrollArea'
import { mayStyled } from '../../styles/runtime'

export const ScrollArea = /*#__PURE__*/ mayStyled('ScrollArea', ScrollAreaBase, componentCss)
export type { ScrollAreaProps, ScrollAxis } from './ScrollArea'
