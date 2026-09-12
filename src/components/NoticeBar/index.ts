import componentCss from './NoticeBar.css?inline'
import { NoticeBar as NoticeBarBase } from './NoticeBar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('NoticeBar', componentCss)
const componentStyles = [componentStyle] as const

export const NoticeBar = withMayStyles('NoticeBar', NoticeBarBase, componentStyles)
export type { NoticeBarProps } from './NoticeBar'
