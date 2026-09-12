import componentCss from './ActionSheet.css?inline'
import { ActionSheet as ActionSheetBase } from './ActionSheet'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('ActionSheet', componentCss)
const componentStyles = [componentStyle] as const

export const ActionSheet = withMayStyles('ActionSheet', ActionSheetBase, componentStyles)
export type { ActionSheetProps, ActionSheetAction } from './ActionSheet'
