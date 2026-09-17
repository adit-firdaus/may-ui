import componentCss from './Pagination.css?inline'
import { Pagination as PaginationBase } from './Pagination'
import { mayStyled } from '../../styles/runtime'

export const Pagination = /*#__PURE__*/ mayStyled('Pagination', PaginationBase, componentCss)
export type { PaginationProps, PaginationSize } from './Pagination'
