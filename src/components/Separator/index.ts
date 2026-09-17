import componentCss from './Separator.css?inline'
import { Separator as SeparatorBase } from './Separator'
import { mayStyled } from '../../styles/runtime'

export const Separator = /*#__PURE__*/ mayStyled('Separator', SeparatorBase, componentCss)
export type { SeparatorProps, SeparatorOrientation } from './Separator'
