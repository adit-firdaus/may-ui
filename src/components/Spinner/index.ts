import componentCss from './Spinner.css?inline'
import { Spinner as SpinnerBase } from './Spinner'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Spinner', componentCss)
const componentStyles = [componentStyle] as const

export const Spinner = withMayStyles('Spinner', SpinnerBase, componentStyles)
export type { SpinnerProps } from './Spinner'
