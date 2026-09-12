import componentCss from './IconTile.css?inline'
import { IconTile as IconTileBase } from './IconTile'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('IconTile', componentCss)
const componentStyles = [componentStyle] as const

export const IconTile = withMayStyles('IconTile', IconTileBase, componentStyles)
export type { IconTileProps, IconTileGradient, IconTileSize } from './IconTile'
