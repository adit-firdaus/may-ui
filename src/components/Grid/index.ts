import componentCss from './Grid.css?inline'
import { Grid as GridBase } from './Grid'
import { mayStyled } from '../../styles/runtime'

export const Grid = /*#__PURE__*/ mayStyled('Grid', GridBase, componentCss)
export type { GridProps } from './Grid'
