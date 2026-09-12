import componentCss from './Avatar.css?inline'
import { Avatar as AvatarBase, AvatarGroup as AvatarGroupBase } from './Avatar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Avatar', componentCss)
const componentStyles = [componentStyle] as const

export const Avatar = withMayStyles('Avatar', AvatarBase, componentStyles)
export const AvatarGroup = withMayStyles('AvatarGroup', AvatarGroupBase, componentStyles)
export { initialsFrom } from './Avatar'
export type { AvatarProps, AvatarGroupProps, AvatarHue, AvatarShape, AvatarSize } from './Avatar'
