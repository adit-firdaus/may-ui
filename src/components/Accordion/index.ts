import componentCss from './Accordion.css?inline'
import collapsibleCss from '../Collapsible/Collapsible.css?inline'
import { Accordion as AccordionBase, AccordionItem as AccordionItemBase } from './Accordion'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Accordion', componentCss)
const collapsibleStyle = mayStyleSheet('Collapsible', collapsibleCss)
const componentStyles = [collapsibleStyle, componentStyle] as const

export const Accordion = withMayStyles('Accordion', AccordionBase, componentStyles)
export const AccordionItem = withMayStyles('AccordionItem', AccordionItemBase, componentStyles)
export type { AccordionProps, AccordionItemProps, AccordionType } from './Accordion'
