import componentCss from './Grid.css?inline'
import { Grid as GridBase } from './Grid'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Grid', componentCss)
const componentStyles = [componentStyle] as const

export const Grid = withMayStyles('Grid', GridBase, componentStyles)
export type { GridProps } from './Grid'
