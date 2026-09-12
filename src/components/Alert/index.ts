import componentCss from './Alert.css?inline'
import { Alert as AlertBase } from './Alert'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Alert', componentCss)
const componentStyles = [componentStyle] as const

export const Alert = withMayStyles('Alert', AlertBase, componentStyles)
export type { AlertProps } from './Alert'
