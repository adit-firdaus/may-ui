import componentCss from './TabBar.css?inline'
import badgeCss from '../../components/Badge/Badge.css?inline'
import { TabBar as TabBarBase } from './TabBar'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('TabBar', componentCss)
const badgeStyle = /*#__PURE__*/ mayStyleSheet('Badge', badgeCss)
const componentStyles = [badgeStyle, componentStyle] as const

export const TabBar = /*#__PURE__*/ mayStyled('TabBar', TabBarBase, componentStyles)
export type { TabBarProps, TabBarItem } from './TabBar'
