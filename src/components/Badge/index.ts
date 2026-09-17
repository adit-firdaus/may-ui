import componentCss from './Badge.css?inline'
import { Badge as BadgeBase } from './Badge'
import { mayStyled } from '../../styles/runtime'

export const Badge = /*#__PURE__*/ mayStyled('Badge', BadgeBase, componentCss)
export type { BadgeProps, BadgeSize, BadgeVariant } from './Badge'
