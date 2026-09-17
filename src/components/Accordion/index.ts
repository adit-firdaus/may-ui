import componentCss from './Accordion.css?inline'
import collapsibleCss from '../Collapsible/Collapsible.css?inline'
import { Accordion as AccordionBase, AccordionItem as AccordionItemBase } from './Accordion'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Accordion', componentCss)
const collapsibleStyle = /*#__PURE__*/ mayStyleSheet('Collapsible', collapsibleCss)
const componentStyles = [collapsibleStyle, componentStyle] as const

export const Accordion = /*#__PURE__*/ mayStyled('Accordion', AccordionBase, componentStyles)
export const AccordionItem = /*#__PURE__*/ mayStyled('AccordionItem', AccordionItemBase, componentStyles)
export type { AccordionProps, AccordionItemProps, AccordionType } from './Accordion'
