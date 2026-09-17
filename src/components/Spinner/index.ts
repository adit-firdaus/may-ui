import componentCss from './Spinner.css?inline'
import { Spinner as SpinnerBase } from './Spinner'
import { mayStyled } from '../../styles/runtime'

export const Spinner = /*#__PURE__*/ mayStyled('Spinner', SpinnerBase, componentCss)
export type { SpinnerProps } from './Spinner'
