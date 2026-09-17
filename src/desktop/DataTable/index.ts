import componentCss from './DataTable.css?inline'
import tableCss from '../../components/Table/Table.css?inline'
import checkboxCss from '../../components/Checkbox/Checkbox.css?inline'
import inputCss from '../../components/Input/Input.css?inline'
import selectCss from '../../components/Select/Select.css?inline'
import paginationCss from '../../components/Pagination/Pagination.css?inline'
import { DataTable as DataTableBase } from './DataTable'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('DataTable', componentCss)
const tableStyle = /*#__PURE__*/ mayStyleSheet('Table', tableCss)
const checkboxStyle = /*#__PURE__*/ mayStyleSheet('Checkbox', checkboxCss)
const inputStyle = /*#__PURE__*/ mayStyleSheet('Input', inputCss)
const selectStyle = /*#__PURE__*/ mayStyleSheet('Select', selectCss)
const paginationStyle = /*#__PURE__*/ mayStyleSheet('Pagination', paginationCss)
const componentStyles = [
  tableStyle,
  checkboxStyle,
  inputStyle,
  selectStyle,
  paginationStyle,
  componentStyle,
] as const

export const DataTable = /*#__PURE__*/ mayStyled('DataTable', DataTableBase, componentStyles)
export type {
  DataTableProps,
  DataTableColumn,
  DataTableRowKey,
  DataTableSort,
  DataTableSortDirection,
  DataTableFilters,
  DataTableValue,
} from './DataTable'
