import componentCss from './Collapsible.css?inline'
import { Collapsible as CollapsibleBase } from './Collapsible'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Collapsible', componentCss)
const componentStyles = [componentStyle] as const

export const Collapsible = withMayStyles('Collapsible', CollapsibleBase, componentStyles)
export type { CollapsibleProps } from './Collapsible'
