import componentCss from './Sidebar.css?inline'
import { Sidebar as SidebarBase, SidebarSection as SidebarSectionBase, SidebarItem as SidebarItemBase, SidebarToggle as SidebarToggleBase } from './Sidebar'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Sidebar', componentCss)
const componentStyles = [componentStyle] as const

export const Sidebar = /*#__PURE__*/ mayStyled('Sidebar', SidebarBase, componentStyles)
export const SidebarSection = /*#__PURE__*/ mayStyled('SidebarSection', SidebarSectionBase, componentStyles)
export const SidebarItem = /*#__PURE__*/ mayStyled('SidebarItem', SidebarItemBase, componentStyles)
export const SidebarToggle = /*#__PURE__*/ mayStyled('SidebarToggle', SidebarToggleBase, componentStyles)
export type {
  SidebarProps,
  SidebarSectionProps,
  SidebarItemProps,
  SidebarToggleProps,
} from './Sidebar'
