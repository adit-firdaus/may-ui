import componentCss from './NavigationBar.css?inline'
import { NavigationBar as NavigationBarBase } from './NavigationBar'
import { mayStyled } from '../../styles/runtime'

export const NavigationBar = /*#__PURE__*/ mayStyled('NavigationBar', NavigationBarBase, componentCss)
export type { NavigationBarProps } from './NavigationBar'
