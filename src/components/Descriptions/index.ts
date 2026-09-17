import componentCss from './Descriptions.css?inline'
import { Descriptions as DescriptionsBase, DescriptionItem as DescriptionItemBase } from './Descriptions'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Descriptions', componentCss)
const componentStyles = [componentStyle] as const

export const Descriptions = /*#__PURE__*/ mayStyled('Descriptions', DescriptionsBase, componentStyles)
export const DescriptionItem = /*#__PURE__*/ mayStyled('DescriptionItem', DescriptionItemBase, componentStyles)
export type { DescriptionsProps, DescriptionItemProps } from './Descriptions'
