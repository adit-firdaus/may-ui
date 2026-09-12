import componentCss from './Box.css?inline'
import { Box as BoxBase } from './Box'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Box', componentCss)
const componentStyles = [componentStyle] as const

export const Box = withMayStyles('Box', BoxBase, componentStyles)
export type { BoxProps, BoxOwnProps, BoxSurface, BoxRadius, BoxShadow, MaySpaceStep } from './Box'
