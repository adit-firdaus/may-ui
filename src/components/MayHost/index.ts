import componentCss from './MayHost.css?inline'
import toastCss from '../Toast/Toast.css?inline'
import buttonCss from '../Button/Button.css?inline'
import { MayHost as MayHostBase } from './MayHost'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('MayHost', componentCss)
const toastStyle = mayStyleSheet('Toast', toastCss)
const buttonStyle = mayStyleSheet('Button', buttonCss)
const componentStyles = [buttonStyle, toastStyle, componentStyle] as const

export const MayHost = withMayStyles('MayHost', MayHostBase, componentStyles)
export type { MayHostProps } from './MayHost'

/* The hook form of the imperative API the host renders for. */
export { useToast } from '../Toast/Toast'
export type { UseToastResult } from '../Toast/Toast'
