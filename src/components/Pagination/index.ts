import componentCss from './Pagination.css?inline'
import { Pagination as PaginationBase } from './Pagination'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Pagination', componentCss)
const componentStyles = [componentStyle] as const

export const Pagination = withMayStyles('Pagination', PaginationBase, componentStyles)
export type { PaginationProps, PaginationSize } from './Pagination'
