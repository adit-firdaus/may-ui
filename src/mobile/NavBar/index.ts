import componentCss from './NavBar.css?inline'
import { NavBar as NavBarBase } from './NavBar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('NavBar', componentCss)
const componentStyles = [componentStyle] as const

export const NavBar = withMayStyles('NavBar', NavBarBase, componentStyles)
export type { NavBarProps } from './NavBar'
