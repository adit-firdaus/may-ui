import componentCss from './DataTable.css?inline'
import tableCss from '../../components/Table/Table.css?inline'
import checkboxCss from '../../components/Checkbox/Checkbox.css?inline'
import inputCss from '../../components/Input/Input.css?inline'
import selectCss from '../../components/Select/Select.css?inline'
import paginationCss from '../../components/Pagination/Pagination.css?inline'
import { DataTable as DataTableBase } from './DataTable'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('DataTable', componentCss)
const tableStyle = mayStyleSheet('Table', tableCss)
const checkboxStyle = mayStyleSheet('Checkbox', checkboxCss)
const inputStyle = mayStyleSheet('Input', inputCss)
const selectStyle = mayStyleSheet('Select', selectCss)
const paginationStyle = mayStyleSheet('Pagination', paginationCss)
const componentStyles = [
  tableStyle,
  checkboxStyle,
  inputStyle,
  selectStyle,
  paginationStyle,
  componentStyle,
] as const

export const DataTable = withMayStyles('DataTable', DataTableBase, componentStyles)
export type {
  DataTableProps,
  DataTableColumn,
  DataTableRowKey,
  DataTableSort,
  DataTableSortDirection,
  DataTableFilters,
  DataTableValue,
} from './DataTable'
