import componentCss from './Box.css?inline'
import { Box as BoxBase } from './Box'
import { mayStyled } from '../../styles/runtime'

export const Box = /*#__PURE__*/ mayStyled('Box', BoxBase, componentCss)
export type { BoxProps, BoxOwnProps, BoxSurface, BoxRadius, BoxShadow, MaySpaceStep } from './Box'
