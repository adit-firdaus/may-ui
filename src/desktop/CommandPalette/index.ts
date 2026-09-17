import componentCss from './CommandPalette.css?inline'
import kbdCss from '../../components/Kbd/Kbd.css?inline'
import { CommandPalette as CommandPaletteBase } from './CommandPalette'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('CommandPalette', componentCss)
const kbdStyle = /*#__PURE__*/ mayStyleSheet('Kbd', kbdCss)
const componentStyles = [kbdStyle, componentStyle] as const

export const CommandPalette = /*#__PURE__*/ mayStyled('CommandPalette', CommandPaletteBase, componentStyles)
export type { CommandPaletteProps, CommandGroup, CommandItem } from './CommandPalette'
