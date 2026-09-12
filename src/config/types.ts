import type { ElementType } from 'react'
import type { MayPlatform } from '../hooks/platform'
import type { AccordionProps } from '../components/Accordion/Accordion'
import type { AlertProps } from '../components/Alert/Alert'
import type { AvatarGroupProps, AvatarProps } from '../components/Avatar/Avatar'
import type { BadgeProps } from '../components/Badge/Badge'
import type { BoxProps } from '../components/Box/Box'
import type { BreadcrumbProps } from '../components/Breadcrumb/Breadcrumb'
import type { ButtonProps } from '../components/Button/Button'
import type { ButtonGroupProps } from '../components/ButtonGroup/ButtonGroup'
import type { CardProps } from '../components/Card/Card'
import type { CheckboxProps } from '../components/Checkbox/Checkbox'
import type { CollapsibleProps } from '../components/Collapsible/Collapsible'
import type { DescriptionsProps } from '../components/Descriptions/Descriptions'
import type { EmptyStateProps } from '../components/EmptyState/EmptyState'
import type { FabProps } from '../components/Fab/Fab'
import type { GridProps } from '../components/Grid/Grid'
import type { HeadingProps } from '../components/Heading/Heading'
import type { IconButtonProps } from '../components/IconButton/IconButton'
import type { IconTileProps } from '../components/IconTile/IconTile'
import type { InputProps } from '../components/Input/Input'
import type { KbdProps } from '../components/Kbd/Kbd'
import type { LabelProps } from '../components/Label/Label'
import type { ListProps } from '../components/List/List'
import type { MenuProps } from '../components/Menu/Menu'
import type { ModalProps } from '../components/Modal/Modal'
import type { NavigationBarProps } from '../components/NavigationBar/NavigationBar'
import type { NoticeBarProps } from '../components/NoticeBar/NoticeBar'
import type { PaginationProps } from '../components/Pagination/Pagination'
import type { PopoverProps } from '../components/Popover/Popover'
import type { CircularProgressProps, ProgressProps } from '../components/Progress/Progress'
import type { RadioGroupProps, RadioProps } from '../components/RadioGroup/RadioGroup'
import type { SafeAreaProps } from '../components/SafeArea/SafeArea'
import type { ScrollAreaProps } from '../components/ScrollArea/ScrollArea'
import type { SearchFieldProps } from '../components/SearchField/SearchField'
import type { SegmentedControlProps } from '../components/SegmentedControl/SegmentedControl'
import type { SelectProps } from '../components/Select/Select'
import type { SeparatorProps } from '../components/Separator/Separator'
import type { SheetProps } from '../components/Sheet/Sheet'
import type { SkeletonProps } from '../components/Skeleton/Skeleton'
import type { SliderProps } from '../components/Slider/Slider'
import type { SpinnerProps } from '../components/Spinner/Spinner'
import type { StackProps } from '../components/Stack/Stack'
import type { StatisticProps } from '../components/Statistic/Statistic'
import type { StepperProps } from '../components/Stepper/Stepper'
import type { StepsProps } from '../components/Steps/Steps'
import type { SwitchProps } from '../components/Switch/Switch'
import type { TableProps } from '../components/Table/Table'
import type { TabListProps, TabsProps } from '../components/Tabs/Tabs'
import type { TagProps } from '../components/Tag/Tag'
import type { TextProps } from '../components/Text/Text'
import type { TextareaProps } from '../components/Textarea/Textarea'
import type { ToastProps, ToastPosition } from '../components/Toast/Toast'
import type { ToolbarProps } from '../components/Toolbar/Toolbar'
import type { TooltipProps } from '../components/Tooltip/Tooltip'
import type { CommandPaletteProps } from '../desktop/CommandPalette/CommandPalette'
import type { ContextMenuProps } from '../desktop/ContextMenu/ContextMenu'
import type { DataTableProps } from '../desktop/DataTable/DataTable'
import type { SidebarSectionProps } from '../desktop/Sidebar/Sidebar'
import type { SplitPaneProps } from '../desktop/SplitPane/SplitPane'
import type { CapsuleTabsProps } from '../mobile/CapsuleTabs/CapsuleTabs'
import type { FloatingBubbleProps } from '../mobile/FloatingBubble/FloatingBubble'
import type { NavBarProps } from '../mobile/NavBar/NavBar'
import type { PopupProps } from '../mobile/Popup/Popup'
import type { SearchBarProps } from '../mobile/SearchBar/SearchBar'
import type { SelectorProps } from '../mobile/Selector/Selector'
import type { SwipeActionProps } from '../mobile/SwipeAction/SwipeAction'
import type { TabBarProps } from '../mobile/TabBar/TabBar'
import type { MayTokens, MayTokenValue } from '../styles/tokens.generated'

export type { MayTokens, MayTokenValue }

type Defaults<Props, Keys extends keyof Props> = Partial<Pick<Props, Keys>>

export interface MayComponentDefaults {
  Accordion?: Defaults<AccordionProps, 'type' | 'collapsible' | 'variant'>
  Alert?: Defaults<AlertProps, 'tone'>
  Avatar?: Defaults<AvatarProps, 'size' | 'shape' | 'hue'>
  AvatarGroup?: Defaults<AvatarGroupProps, 'max' | 'size'>
  Badge?: Defaults<BadgeProps, 'variant' | 'tone' | 'size' | 'dot'>
  Box?: Defaults<BoxProps, 'padding' | 'paddingX' | 'paddingY' | 'surface' | 'radius' | 'shadow' | 'fullWidth'>
  Breadcrumb?: Defaults<BreadcrumbProps, 'maxItems' | 'itemsBeforeCollapse' | 'itemsAfterCollapse' | 'size'>
  Button?: Defaults<ButtonProps, 'variant' | 'tone' | 'size' | 'pill' | 'fullWidth'>
  ButtonGroup?: Defaults<ButtonGroupProps, 'attached' | 'orientation' | 'fullWidth'>
  Card?: Defaults<CardProps, 'variant' | 'padding' | 'interactive'>
  Checkbox?: Defaults<CheckboxProps, 'size'>
  Collapsible?: Defaults<CollapsibleProps, 'chevron'>
  Descriptions?: Defaults<DescriptionsProps, 'variant' | 'layout' | 'columns'>
  EmptyState?: Defaults<EmptyStateProps, 'size'>
  Fab?: Defaults<FabProps, 'tone' | 'size' | 'fixed' | 'position'>
  Grid?: Defaults<GridProps, 'columns' | 'minColumnWidth' | 'gap'>
  Heading?: Defaults<HeadingProps, 'size' | 'tone' | 'weight' | 'align' | 'clamp'>
  IconButton?: Defaults<IconButtonProps, 'variant' | 'tone' | 'size' | 'round'>
  IconTile?: Defaults<IconTileProps, 'gradient' | 'size'>
  Input?: Defaults<InputProps, 'size' | 'fullWidth'>
  Kbd?: Defaults<KbdProps, 'size'>
  Label?: Defaults<LabelProps, 'variant' | 'tone' | 'weight' | 'uppercase'>
  List?: Defaults<ListProps, 'variant'>
  Menu?: Defaults<MenuProps, 'placement' | 'offset'>
  Modal?: Defaults<ModalProps, 'footerLayout' | 'size' | 'closeButton' | 'closeOnScrimClick' | 'closeOnEscape'>
  NavigationBar?: Defaults<NavigationBarProps, 'sticky' | 'safeArea'>
  NoticeBar?: Defaults<NoticeBarProps, 'tone' | 'marquee' | 'speed'>
  Pagination?: Defaults<PaginationProps, 'siblingCount' | 'size' | 'compact'>
  Popover?: Defaults<PopoverProps, 'placement' | 'offset' | 'arrow' | 'autoFocus' | 'padded'>
  Progress?: Defaults<ProgressProps, 'tone' | 'size'>
  CircularProgress?: Defaults<CircularProgressProps, 'tone' | 'size'>
  RadioGroup?: Defaults<RadioGroupProps, 'orientation' | 'size'>
  Radio?: Defaults<RadioProps, 'size'>
  SafeArea?: Defaults<SafeAreaProps, 'edges'>
  ScrollArea?: Defaults<ScrollAreaProps, 'maxHeight' | 'axis'>
  SearchField?: Defaults<SearchFieldProps, 'size' | 'cancelable' | 'fullWidth'>
  SegmentedControl?: Defaults<SegmentedControlProps, 'size' | 'fullWidth'>
  Select?: Defaults<SelectProps, 'size' | 'fullWidth'>
  Separator?: Defaults<SeparatorProps, 'orientation'>
  Sheet?: Defaults<SheetProps, 'footerLayout' | 'size' | 'grabber' | 'side' | 'dismissible' | 'closeOnScrimClick'>
  Skeleton?: Defaults<SkeletonProps, 'variant' | 'lines' | 'width' | 'height' | 'radius'>
  Slider?: Defaults<SliderProps, 'showValue' | 'tone'>
  Spinner?: Defaults<SpinnerProps, 'tone' | 'size' | 'spokes'>
  Stack?: Defaults<StackProps, 'direction' | 'gap' | 'align' | 'justify' | 'wrap' | 'fullWidth'>
  Statistic?: Defaults<StatisticProps, 'direction' | 'invertDelta' | 'size' | 'variant'>
  Stepper?: Defaults<StepperProps, 'size'>
  Steps?: Defaults<StepsProps, 'orientation' | 'clickable' | 'size'>
  Switch?: Defaults<SwitchProps, 'size' | 'labelPosition'>
  Table?: Defaults<TableProps<unknown>, 'size' | 'stickyHeader' | 'zebra' | 'maxHeight'>
  TabList?: Defaults<TabListProps, 'fullWidth'>
  Tabs?: Defaults<TabsProps, 'variant' | 'orientation' | 'size'>
  Tag?: Defaults<TagProps, 'tone' | 'size'>
  Text?: Defaults<TextProps, 'variant' | 'tone' | 'weight' | 'align' | 'clamp' | 'mono'>
  Textarea?: Defaults<TextareaProps, 'size' | 'fullWidth' | 'rows' | 'resize' | 'autoGrow'>
  Toast?: Defaults<ToastProps, 'tone' | 'position' | 'dismissible' | 'closeButton'>
  Toolbar?: Defaults<ToolbarProps, 'placement' | 'sticky' | 'align' | 'separator' | 'variant' | 'safeArea'>
  Tooltip?: Defaults<TooltipProps, 'placement' | 'offset' | 'delay'>
  CommandPalette?: Defaults<CommandPaletteProps, 'maxRecent' | 'hotkey' | 'hideFooter'>
  ContextMenu?: Defaults<ContextMenuProps, 'size'>
  DataTable?: Defaults<DataTableProps<unknown>, 'size' | 'selectable' | 'resizableColumns' | 'stickyHeader' | 'stickyColumn' | 'pageSize' | 'virtualized' | 'rowHeight' | 'maxHeight' | 'zebra'>
  SidebarSection?: Defaults<SidebarSectionProps, 'collapsible'>
  SplitPane?: Defaults<SplitPaneProps, 'orientation' | 'size' | 'min' | 'max' | 'collapsible'>
  CapsuleTabs?: Defaults<CapsuleTabsProps, 'variant' | 'size'>
  FloatingBubble?: Defaults<FloatingBubbleProps, 'tone' | 'size'>
  NavBar?: Defaults<NavBarProps, 'separator' | 'position' | 'variant' | 'hideOnScroll'>
  Popup?: Defaults<PopupProps, 'position' | 'height' | 'closeOnMaskClick' | 'grabber' | 'safeArea' | 'padded'>
  SearchBar?: Defaults<SearchBarProps, 'size' | 'showCancel' | 'align'>
  Selector?: Defaults<SelectorProps, 'variant' | 'size' | 'columns'>
  SwipeAction?: Defaults<SwipeActionProps, 'fullSwipe'>
  TabBar?: Defaults<TabBarProps, 'fixed' | 'labels' | 'tone'>
}

export type MayThemeMode = 'light' | 'dark' | 'system'

export interface MayThemeConfig {
  mode?: MayThemeMode
  tokens?: Partial<MayTokens>
  light?: Partial<MayTokens>
  dark?: Partial<MayTokens>
}

export interface MayHostConfig {
  position?: ToastPosition
  max?: number
  duration?: number
  closeLabel?: string
  label?: string
}

export interface MayConfigValue {
  readonly theme: Readonly<{ mode: MayThemeMode; resolvedMode: Exclude<MayThemeMode, 'system'> }>
  readonly tokens: Readonly<MayTokens>
  readonly components: Readonly<MayComponentDefaults>
  readonly platform: MayPlatform
  readonly linkComponent: ElementType
  readonly host: false | Readonly<MayHostConfig>
  readonly styleNonce?: string
}
