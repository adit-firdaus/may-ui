import componentCss from './SegmentedControl.css?inline'
import { SegmentedControl as SegmentedControlBase } from './SegmentedControl'
import { mayStyled } from '../../styles/runtime'

export const SegmentedControl = /*#__PURE__*/ mayStyled('SegmentedControl', SegmentedControlBase, componentCss)
export type { SegmentedControlProps, SegmentedOption } from './SegmentedControl'
