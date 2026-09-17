import componentCss from './Steps.css?inline'
import { Steps as StepsBase } from './Steps'
import { mayStyled } from '../../styles/runtime'

export const Steps = /*#__PURE__*/ mayStyled('Steps', StepsBase, componentCss)
export type { StepsProps, StepItem, StepStatus, StepsOrientation, StepsSize } from './Steps'
