import componentCss from './Card.css?inline'
import { Card as CardBase, CardHeader as CardHeaderBase, CardTitle as CardTitleBase, CardDescription as CardDescriptionBase, CardBody as CardBodyBase, CardFooter as CardFooterBase } from './Card'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Card', componentCss)
const componentStyles = [componentStyle] as const

export const Card = /*#__PURE__*/ mayStyled('Card', CardBase, componentStyles)
export const CardHeader = /*#__PURE__*/ mayStyled('CardHeader', CardHeaderBase, componentStyles)
export const CardTitle = /*#__PURE__*/ mayStyled('CardTitle', CardTitleBase, componentStyles)
export const CardDescription = /*#__PURE__*/ mayStyled('CardDescription', CardDescriptionBase, componentStyles)
export const CardBody = /*#__PURE__*/ mayStyled('CardBody', CardBodyBase, componentStyles)
export const CardFooter = /*#__PURE__*/ mayStyled('CardFooter', CardFooterBase, componentStyles)
export type {
  CardProps,
  CardVariant,
  CardPadding,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardBodyProps,
  CardFooterProps,
} from './Card'
