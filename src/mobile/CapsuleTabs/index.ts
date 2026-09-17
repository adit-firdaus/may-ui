import componentCss from './CapsuleTabs.css?inline'
import { CapsuleTabs as CapsuleTabsBase } from './CapsuleTabs'
import { mayStyled } from '../../styles/runtime'

export const CapsuleTabs = /*#__PURE__*/ mayStyled('CapsuleTabs', CapsuleTabsBase, componentCss)
export type {
  CapsuleTabsProps,
  CapsuleTab,
  CapsuleTabsSize,
  CapsuleTabsVariant,
} from './CapsuleTabs'
