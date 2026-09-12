import componentCss from './Badge.css?inline'
import { Badge as BadgeBase } from './Badge'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Badge', componentCss)
const componentStyles = [componentStyle] as const

export const Badge = withMayStyles('Badge', BadgeBase, componentStyles)
export type { BadgeProps, BadgeSize, BadgeVariant } from './Badge'
