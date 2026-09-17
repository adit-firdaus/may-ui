import componentCss from './Sheet.css?inline'
import { Sheet as SheetBase } from './Sheet'
import { mayStyled } from '../../styles/runtime'

export const Sheet = /*#__PURE__*/ mayStyled('Sheet', SheetBase, componentCss)
export type { SheetProps } from './Sheet'
