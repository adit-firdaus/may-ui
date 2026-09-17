import componentCss from './ActionSheet.css?inline'
import { ActionSheet as ActionSheetBase } from './ActionSheet'
import { mayStyled } from '../../styles/runtime'

export const ActionSheet = /*#__PURE__*/ mayStyled('ActionSheet', ActionSheetBase, componentCss)
export type { ActionSheetProps, ActionSheetAction } from './ActionSheet'
