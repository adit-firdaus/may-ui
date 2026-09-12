import componentCss from './TabBar.css?inline'
import badgeCss from '../../components/Badge/Badge.css?inline'
import { TabBar as TabBarBase } from './TabBar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('TabBar', componentCss)
const badgeStyle = mayStyleSheet('Badge', badgeCss)
const componentStyles = [badgeStyle, componentStyle] as const

export const TabBar = withMayStyles('TabBar', TabBarBase, componentStyles)
export type { TabBarProps, TabBarItem } from './TabBar'
