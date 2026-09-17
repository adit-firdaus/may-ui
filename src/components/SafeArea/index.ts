import componentCss from './SafeArea.css?inline'
import { SafeArea as SafeAreaBase } from './SafeArea'
import { mayStyled } from '../../styles/runtime'

export const SafeArea = /*#__PURE__*/ mayStyled('SafeArea', SafeAreaBase, componentCss)
export type { SafeAreaProps, SafeAreaEdge } from './SafeArea'
