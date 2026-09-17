import componentCss from './Fab.css?inline'
import { Fab as FabBase } from './Fab'
import { mayStyled } from '../../styles/runtime'

export const Fab = /*#__PURE__*/ mayStyled('Fab', FabBase, componentCss)
export type { FabProps } from './Fab'
