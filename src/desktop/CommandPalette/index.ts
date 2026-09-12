import componentCss from './CommandPalette.css?inline'
import kbdCss from '../../components/Kbd/Kbd.css?inline'
import { CommandPalette as CommandPaletteBase } from './CommandPalette'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('CommandPalette', componentCss)
const kbdStyle = mayStyleSheet('Kbd', kbdCss)
const componentStyles = [kbdStyle, componentStyle] as const

export const CommandPalette = withMayStyles('CommandPalette', CommandPaletteBase, componentStyles)
export type { CommandPaletteProps, CommandGroup, CommandItem } from './CommandPalette'
