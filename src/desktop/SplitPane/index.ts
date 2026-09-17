import componentCss from './SplitPane.css?inline'
import { SplitPane as SplitPaneBase } from './SplitPane'
import { mayStyled } from '../../styles/runtime'

export const SplitPane = /*#__PURE__*/ mayStyled('SplitPane', SplitPaneBase, componentCss)
export type { SplitPaneProps, SplitPaneOrientation } from './SplitPane'
