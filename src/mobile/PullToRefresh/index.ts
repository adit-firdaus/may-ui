import componentCss from './PullToRefresh.css?inline'
import spinnerCss from '../../components/Spinner/Spinner.css?inline'
import { PullToRefresh as PullToRefreshBase } from './PullToRefresh'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('PullToRefresh', componentCss)
const spinnerStyle = mayStyleSheet('Spinner', spinnerCss)
const componentStyles = [spinnerStyle, componentStyle] as const

export const PullToRefresh = withMayStyles('PullToRefresh', PullToRefreshBase, componentStyles)
export type { PullToRefreshProps } from './PullToRefresh'
