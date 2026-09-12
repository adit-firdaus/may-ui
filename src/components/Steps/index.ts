import componentCss from './Steps.css?inline'
import { Steps as StepsBase } from './Steps'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Steps', componentCss)
const componentStyles = [componentStyle] as const

export const Steps = withMayStyles('Steps', StepsBase, componentStyles)
export type { StepsProps, StepItem, StepStatus, StepsOrientation, StepsSize } from './Steps'
