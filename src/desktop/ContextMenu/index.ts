import componentCss from './ContextMenu.css?inline'
import kbdCss from '../../components/Kbd/Kbd.css?inline'
import { ContextMenu as ContextMenuBase } from './ContextMenu'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('ContextMenu', componentCss)
const kbdStyle = mayStyleSheet('Kbd', kbdCss)
const componentStyles = [kbdStyle, componentStyle] as const

export const ContextMenu = withMayStyles('ContextMenu', ContextMenuBase, componentStyles)
export type {
  ContextMenuProps,
  ContextMenuEntry,
  ContextMenuAction,
  ContextMenuSeparator,
  ContextMenuLabel,
} from './ContextMenu'
