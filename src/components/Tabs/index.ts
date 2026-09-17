import componentCss from './Tabs.css?inline'
import { Tabs as TabsBase, TabList as TabListBase, Tab as TabBase, TabPanel as TabPanelBase } from './Tabs'
import { mayStyled, mayStyleSheet } from '../../styles/runtime'

const componentStyle = /*#__PURE__*/ mayStyleSheet('Tabs', componentCss)
const componentStyles = [componentStyle] as const

export const Tabs = /*#__PURE__*/ mayStyled('Tabs', TabsBase, componentStyles)
export const TabList = /*#__PURE__*/ mayStyled('TabList', TabListBase, componentStyles)
export const Tab = /*#__PURE__*/ mayStyled('Tab', TabBase, componentStyles)
export const TabPanel = /*#__PURE__*/ mayStyled('TabPanel', TabPanelBase, componentStyles)
export type {
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
  TabsVariant,
  TabsOrientation,
  TabsSize,
} from './Tabs'
