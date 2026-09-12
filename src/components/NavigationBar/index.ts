import componentCss from './NavigationBar.css?inline'
import { NavigationBar as NavigationBarBase } from './NavigationBar'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('NavigationBar', componentCss)
const componentStyles = [componentStyle] as const

export const NavigationBar = withMayStyles('NavigationBar', NavigationBarBase, componentStyles)
export type { NavigationBarProps } from './NavigationBar'
