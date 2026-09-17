import componentCss from './EmptyState.css?inline'
import { EmptyState as EmptyStateBase } from './EmptyState'
import { mayStyled } from '../../styles/runtime'

export const EmptyState = /*#__PURE__*/ mayStyled('EmptyState', EmptyStateBase, componentCss)
export type { EmptyStateProps } from './EmptyState'
