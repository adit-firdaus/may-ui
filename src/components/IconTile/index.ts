import componentCss from './IconTile.css?inline'
import { IconTile as IconTileBase } from './IconTile'
import { mayStyled } from '../../styles/runtime'

export const IconTile = /*#__PURE__*/ mayStyled('IconTile', IconTileBase, componentCss)
export type { IconTileProps, IconTileGradient, IconTileSize } from './IconTile'
