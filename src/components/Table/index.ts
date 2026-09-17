import componentCss from './Table.css?inline'
import listCss from '../List/List.css?inline'
import { Table as TableBase } from './Table'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Table', componentCss)
const listStyle = /*#__PURE__*/ mayStyleSheet('List', listCss)
const componentStyles = [listStyle, componentStyle] as const

export const Table = /*#__PURE__*/ mayStyled('Table', TableBase, componentStyles)
export type { TableProps, TableColumn, TableRowKey } from './Table'
