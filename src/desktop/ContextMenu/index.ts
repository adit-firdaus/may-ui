import componentCss from './ContextMenu.css?inline'
import kbdCss from '../../components/Kbd/Kbd.css?inline'
import { ContextMenu as ContextMenuBase } from './ContextMenu'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('ContextMenu', componentCss)
const kbdStyle = /*#__PURE__*/ mayStyleSheet('Kbd', kbdCss)
const componentStyles = [kbdStyle, componentStyle] as const

export const ContextMenu = /*#__PURE__*/ mayStyled('ContextMenu', ContextMenuBase, componentStyles)
export type {
  ContextMenuProps,
  ContextMenuEntry,
  ContextMenuAction,
  ContextMenuSeparator,
  ContextMenuLabel,
} from './ContextMenu'
