import componentCss from './Toast.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { Toast as ToastBase } from './Toast'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Toast', componentCss)
const buttonStyle = /*#__PURE__*/ mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, componentStyle] as const

export const Toast = /*#__PURE__*/ mayStyled('Toast', ToastBase, componentStyles)
export { toast, dismiss, dismissAll, useToast, setToastLimit } from './Toast'
export type {
  ToastProps,
  ToastAction,
  ToastOptions,
  ToastRecord,
  ToastPosition,
  ToastFn,
  UseToastResult,
} from './Toast'
