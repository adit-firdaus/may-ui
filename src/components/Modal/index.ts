import componentCss from './Modal.css?inline'
import { Modal as ModalBase } from './Modal'
import { mayStyled } from '../../styles/runtime'

export const Modal = /*#__PURE__*/ mayStyled('Modal', ModalBase, componentCss)
export type { ModalProps } from './Modal'
