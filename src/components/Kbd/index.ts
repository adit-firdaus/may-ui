import componentCss from './Kbd.css?inline'
import { Kbd as KbdBase } from './Kbd'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Kbd', componentCss)
const componentStyles = [componentStyle] as const

export const Kbd = withMayStyles('Kbd', KbdBase, componentStyles)
export type { KbdProps } from './Kbd'
