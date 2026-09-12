import componentCss from './Sheet.css?inline'
import { Sheet as SheetBase } from './Sheet'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Sheet', componentCss)
const componentStyles = [componentStyle] as const

export const Sheet = withMayStyles('Sheet', SheetBase, componentStyles)
export type { SheetProps } from './Sheet'
