import componentCss from './Popup.css?inline'
import sheetCss from '../../components/Sheet/Sheet.css?inline'
import { Popup as PopupBase } from './Popup'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Popup', componentCss)
const sheetStyle = /*#__PURE__*/ mayStyleSheet('Sheet', sheetCss)
const componentStyles = [sheetStyle, componentStyle] as const

export const Popup = /*#__PURE__*/ mayStyled('Popup', PopupBase, componentStyles)
export type { PopupProps } from './Popup'
