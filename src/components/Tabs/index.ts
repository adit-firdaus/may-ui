import componentCss from './Tabs.css?inline'
import { Tabs as TabsBase, TabList as TabListBase, Tab as TabBase, TabPanel as TabPanelBase } from './Tabs'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('Tabs', componentCss)
const componentStyles = [componentStyle] as const

export const Tabs = withMayStyles('Tabs', TabsBase, componentStyles)
export const TabList = withMayStyles('TabList', TabListBase, componentStyles)
export const Tab = withMayStyles('Tab', TabBase, componentStyles)
export const TabPanel = withMayStyles('TabPanel', TabPanelBase, componentStyles)
export type {
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
  TabsVariant,
  TabsOrientation,
  TabsSize,
} from './Tabs'
