import componentCss from './Collapsible.css?inline'
import { Collapsible as CollapsibleBase } from './Collapsible'
import { mayStyled } from '../../styles/runtime'

export const Collapsible = /*#__PURE__*/ mayStyled('Collapsible', CollapsibleBase, componentCss)
export type { CollapsibleProps } from './Collapsible'
