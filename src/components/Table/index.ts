import componentCss from './Table.css?inline'
import listCss from '../List/List.css?inline'
import { Table as TableBase } from './Table'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Table', componentCss)
const listStyle = mayStyleSheet('List', listCss)
const componentStyles = [listStyle, componentStyle] as const

export const Table = withMayStyles('Table', TableBase, componentStyles)
export type { TableProps, TableColumn, TableRowKey } from './Table'
