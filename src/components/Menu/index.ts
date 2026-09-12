import componentCss from './Menu.css?inline'
import { Menu as MenuBase } from './Menu'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Menu', componentCss)
const componentStyles = [componentStyle] as const

export const Menu = withMayStyles('Menu', MenuBase, componentStyles)
export type { MenuProps, MenuItem } from './Menu'
