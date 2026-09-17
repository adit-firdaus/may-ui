import componentCss from './NoticeBar.css?inline'
import { NoticeBar as NoticeBarBase } from './NoticeBar'
import { mayStyled } from '../../styles/runtime'

export const NoticeBar = /*#__PURE__*/ mayStyled('NoticeBar', NoticeBarBase, componentCss)
export type { NoticeBarProps } from './NoticeBar'
