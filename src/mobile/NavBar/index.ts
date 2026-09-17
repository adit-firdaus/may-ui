import componentCss from './NavBar.css?inline'
import { NavBar as NavBarBase } from './NavBar'
import { mayStyled } from '../../styles/runtime'

export const NavBar = /*#__PURE__*/ mayStyled('NavBar', NavBarBase, componentCss)
export type { NavBarProps } from './NavBar'
