import componentCss from './Sidebar.css?inline'
import { Sidebar as SidebarBase, SidebarSection as SidebarSectionBase, SidebarItem as SidebarItemBase, SidebarToggle as SidebarToggleBase } from './Sidebar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Sidebar', componentCss)
const componentStyles = [componentStyle] as const

export const Sidebar = withMayStyles('Sidebar', SidebarBase, componentStyles)
export const SidebarSection = withMayStyles('SidebarSection', SidebarSectionBase, componentStyles)
export const SidebarItem = withMayStyles('SidebarItem', SidebarItemBase, componentStyles)
export const SidebarToggle = withMayStyles('SidebarToggle', SidebarToggleBase, componentStyles)
export type {
  SidebarProps,
  SidebarSectionProps,
  SidebarItemProps,
  SidebarToggleProps,
} from './Sidebar'
