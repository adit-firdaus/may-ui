import componentCss from './EmptyState.css?inline'
import { EmptyState as EmptyStateBase } from './EmptyState'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('EmptyState', componentCss)
const componentStyles = [componentStyle] as const

export const EmptyState = withMayStyles('EmptyState', EmptyStateBase, componentStyles)
export type { EmptyStateProps } from './EmptyState'
