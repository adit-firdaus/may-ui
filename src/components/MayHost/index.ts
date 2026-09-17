import componentCss from './MayHost.css?inline'
import toastCss from '../Toast/Toast.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { MayHost as MayHostBase } from './MayHost'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('MayHost', componentCss)
const toastStyle = /*#__PURE__*/ mayStyleSheet('Toast', toastCss)
const buttonStyle = /*#__PURE__*/ mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, toastStyle, componentStyle] as const

export const MayHost = /*#__PURE__*/ mayStyled('MayHost', MayHostBase, componentStyles)
export type { MayHostProps } from './MayHost'

/* The hook form of the imperative API the host renders for. */
export { useToast } from '../Toast/Toast'
export type { UseToastResult } from '../Toast/Toast'
