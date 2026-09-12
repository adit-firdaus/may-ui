import componentCss from './Descriptions.css?inline'
import { Descriptions as DescriptionsBase, DescriptionItem as DescriptionItemBase } from './Descriptions'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Descriptions', componentCss)
const componentStyles = [componentStyle] as const

export const Descriptions = withMayStyles('Descriptions', DescriptionsBase, componentStyles)
export const DescriptionItem = withMayStyles('DescriptionItem', DescriptionItemBase, componentStyles)
export type { DescriptionsProps, DescriptionItemProps } from './Descriptions'
