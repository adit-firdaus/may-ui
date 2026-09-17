import componentCss from './Menu.css?inline'
import { Menu as MenuBase } from './Menu'
import { mayStyled } from '../../styles/runtime'

export const Menu = /*#__PURE__*/ mayStyled('Menu', MenuBase, componentCss)
export type { MenuProps, MenuItem } from './Menu'
