import componentCss from './Separator.css?inline'
import { Separator as SeparatorBase } from './Separator'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Separator', componentCss)
const componentStyles = [componentStyle] as const

export const Separator = withMayStyles('Separator', SeparatorBase, componentStyles)
export type { SeparatorProps, SeparatorOrientation } from './Separator'
