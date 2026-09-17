import componentCss from './NavTree.css?inline'
import { NavTree as NavTreeBase } from './NavTree'
import { mayStyled } from '../../styles/runtime'

export const NavTree = /*#__PURE__*/ mayStyled('NavTree', NavTreeBase, componentCss)
export type { NavTreeProps, NavTreeNode } from './NavTree'
