import componentCss from './List.css?inline'
import { List as ListBase, ListRow as ListRowBase } from './List'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('List', componentCss)
const componentStyles = [componentStyle] as const

export const List = /*#__PURE__*/ mayStyled('List', ListBase, componentStyles)
export const ListRow = /*#__PURE__*/ mayStyled('ListRow', ListRowBase, componentStyles)
export type { ListProps, ListRowProps } from './List'
