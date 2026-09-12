import componentCss from './VisuallyHidden.css?inline'
import { VisuallyHidden as VisuallyHiddenBase } from './VisuallyHidden'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('VisuallyHidden', componentCss)
const componentStyles = [componentStyle] as const

export const VisuallyHidden = withMayStyles('VisuallyHidden', VisuallyHiddenBase, componentStyles)
export type { VisuallyHiddenProps } from './VisuallyHidden'
