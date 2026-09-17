import componentCss from './PullToRefresh.css?inline'
import spinnerCss from '../../components/Spinner/Spinner.css?inline'
import { PullToRefresh as PullToRefreshBase } from './PullToRefresh'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('PullToRefresh', componentCss)
const spinnerStyle = /*#__PURE__*/ mayStyleSheet('Spinner', spinnerCss)
const componentStyles = [spinnerStyle, componentStyle] as const

export const PullToRefresh = /*#__PURE__*/ mayStyled('PullToRefresh', PullToRefreshBase, componentStyles)
export type { PullToRefreshProps } from './PullToRefresh'
