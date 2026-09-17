import componentCss from './Stepper.css?inline'
import { Stepper as StepperBase } from './Stepper'
import { mayStyled } from '../../styles/runtime'

export const Stepper = /*#__PURE__*/ mayStyled('Stepper', StepperBase, componentCss)
export type { StepperProps } from './Stepper'
