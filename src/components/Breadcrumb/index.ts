import componentCss from './Breadcrumb.css?inline'
import { Breadcrumb as BreadcrumbBase } from './Breadcrumb'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Breadcrumb', componentCss)
const componentStyles = [componentStyle] as const

export const Breadcrumb = withMayStyles('Breadcrumb', BreadcrumbBase, componentStyles)
export type { BreadcrumbProps, BreadcrumbItem, BreadcrumbSize } from './Breadcrumb'
