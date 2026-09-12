import componentCss from './NavTree.css?inline'
import { NavTree as NavTreeBase } from './NavTree'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('NavTree', componentCss)
const componentStyles = [componentStyle] as const

export const NavTree = withMayStyles('NavTree', NavTreeBase, componentStyles)
export type { NavTreeProps, NavTreeNode } from './NavTree'
