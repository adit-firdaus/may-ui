import componentCss from './Alert.css?inline'
import { Alert as AlertBase } from './Alert'
import { mayStyled } from '../../styles/runtime'

export const Alert = /*#__PURE__*/ mayStyled('Alert', AlertBase, componentCss)
export type { AlertProps } from './Alert'
