import componentCss from './List.css?inline'
import { List as ListBase, ListRow as ListRowBase } from './List'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('List', componentCss)
const componentStyles = [componentStyle] as const

export const List = withMayStyles('List', ListBase, componentStyles)
export const ListRow = withMayStyles('ListRow', ListRowBase, componentStyles)
export type { ListProps, ListRowProps } from './List'
