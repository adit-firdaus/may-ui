import componentCss from './CapsuleTabs.css?inline'
import { CapsuleTabs as CapsuleTabsBase } from './CapsuleTabs'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('CapsuleTabs', componentCss)
const componentStyles = [componentStyle] as const

export const CapsuleTabs = withMayStyles('CapsuleTabs', CapsuleTabsBase, componentStyles)
export type {
  CapsuleTabsProps,
  CapsuleTab,
  CapsuleTabsSize,
  CapsuleTabsVariant,
} from './CapsuleTabs'
