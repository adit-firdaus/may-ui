import componentCss from './Modal.css?inline'
import { Modal as ModalBase } from './Modal'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Modal', componentCss)
const componentStyles = [componentStyle] as const

export const Modal = withMayStyles('Modal', ModalBase, componentStyles)
export type { ModalProps } from './Modal'
