import componentCss from './Breadcrumb.css?inline'
import { Breadcrumb as BreadcrumbBase } from './Breadcrumb'
import { mayStyled } from '../../styles/runtime'

export const Breadcrumb = /*#__PURE__*/ mayStyled('Breadcrumb', BreadcrumbBase, componentCss)
export type { BreadcrumbProps, BreadcrumbItem, BreadcrumbSize } from './Breadcrumb'
