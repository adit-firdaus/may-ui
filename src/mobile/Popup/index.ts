import componentCss from './Popup.css?inline'
import sheetCss from '../../components/Sheet/Sheet.css?inline'
import { Popup as PopupBase } from './Popup'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Popup', componentCss)
const sheetStyle = mayStyleSheet('Sheet', sheetCss)
const componentStyles = [sheetStyle, componentStyle] as const

export const Popup = withMayStyles('Popup', PopupBase, componentStyles)
export type { PopupProps } from './Popup'
