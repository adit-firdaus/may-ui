import componentCss from './Toast.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { Toast as ToastBase } from './Toast'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Toast', componentCss)
const buttonStyle = mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, componentStyle] as const

export const Toast = withMayStyles('Toast', ToastBase, componentStyles)
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
