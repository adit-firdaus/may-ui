import componentCss from './Slider.css?inline'
import { Slider as SliderBase } from './Slider'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Slider', componentCss)
const componentStyles = [componentStyle] as const

export const Slider = withMayStyles('Slider', SliderBase, componentStyles)
export type { SliderProps } from './Slider'
