import componentCss from './Tag.css?inline'
import { Tag as TagBase } from './Tag'
import { mayStyled } from '../../styles/runtime'

export const Tag = /*#__PURE__*/ mayStyled('Tag', TagBase, componentCss)
export type { TagProps, TagSize } from './Tag'
