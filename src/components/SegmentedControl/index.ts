import componentCss from './SegmentedControl.css?inline'
import { SegmentedControl as SegmentedControlBase } from './SegmentedControl'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('SegmentedControl', componentCss)
const componentStyles = [componentStyle] as const

export const SegmentedControl = withMayStyles('SegmentedControl', SegmentedControlBase, componentStyles)
export type { SegmentedControlProps, SegmentedOption } from './SegmentedControl'
