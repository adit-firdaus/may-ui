import componentCss from './Fab.css?inline'
import { Fab as FabBase } from './Fab'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Fab', componentCss)
const componentStyles = [componentStyle] as const

export const Fab = withMayStyles('Fab', FabBase, componentStyles)
export type { FabProps } from './Fab'
