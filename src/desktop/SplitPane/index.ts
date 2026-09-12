import componentCss from './SplitPane.css?inline'
import { SplitPane as SplitPaneBase } from './SplitPane'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SplitPane', componentCss)
const componentStyles = [componentStyle] as const

export const SplitPane = withMayStyles('SplitPane', SplitPaneBase, componentStyles)
export type { SplitPaneProps, SplitPaneOrientation } from './SplitPane'
