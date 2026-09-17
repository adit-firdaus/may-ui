import componentCss from './Avatar.css?inline'
import { Avatar as AvatarBase, AvatarGroup as AvatarGroupBase } from './Avatar'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Avatar', componentCss)
const componentStyles = [componentStyle] as const

export const Avatar = /*#__PURE__*/ mayStyled('Avatar', AvatarBase, componentStyles)
export const AvatarGroup = /*#__PURE__*/ mayStyled('AvatarGroup', AvatarGroupBase, componentStyles)
export { initialsFrom } from './Avatar'
export type { AvatarProps, AvatarGroupProps, AvatarHue, AvatarShape, AvatarSize } from './Avatar'
