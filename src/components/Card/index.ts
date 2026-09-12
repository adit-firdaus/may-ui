import componentCss from './Card.css?inline'
import { Card as CardBase, CardHeader as CardHeaderBase, CardTitle as CardTitleBase, CardDescription as CardDescriptionBase, CardBody as CardBodyBase, CardFooter as CardFooterBase } from './Card'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Card', componentCss)
const componentStyles = [componentStyle] as const

export const Card = withMayStyles('Card', CardBase, componentStyles)
export const CardHeader = withMayStyles('CardHeader', CardHeaderBase, componentStyles)
export const CardTitle = withMayStyles('CardTitle', CardTitleBase, componentStyles)
export const CardDescription = withMayStyles('CardDescription', CardDescriptionBase, componentStyles)
export const CardBody = withMayStyles('CardBody', CardBodyBase, componentStyles)
export const CardFooter = withMayStyles('CardFooter', CardFooterBase, componentStyles)
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
