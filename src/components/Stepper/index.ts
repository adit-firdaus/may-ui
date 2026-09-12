import componentCss from './Stepper.css?inline'
import { Stepper as StepperBase } from './Stepper'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Stepper', componentCss)
const componentStyles = [componentStyle] as const

export const Stepper = withMayStyles('Stepper', StepperBase, componentStyles)
export type { StepperProps } from './Stepper'
