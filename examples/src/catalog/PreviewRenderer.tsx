import type { ComponentType, ReactNode } from 'react'
import { createElement as h, useState } from 'react'
import * as Adaptive from '@adit_firdaus/may-ui'
import * as Desktop from '@adit_firdaus/may-ui/desktop'
import * as Mobile from '@adit_firdaus/may-ui/mobile'
import type { CatalogEntry } from '../site-types'

const noop = () => {}
const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
]

const baseProps: Record<string, Record<string, unknown>> = {
  ActionSheet: { open: false, onClose: noop, items: [{ label: 'Copy', onSelect: noop }] },
  Alert: { title: 'A thoughtful heads-up', children: 'May UI keeps feedback concise and actionable.' },
  AlertDialog: { open: false, onClose: noop, onConfirm: noop, title: 'Remove this item?' },
  Avatar: { name: 'Ada Lovelace' },
  Badge: { children: 'New' },
  Breadcrumb: { items: [{ label: 'Library', href: '#' }, { label: 'Components' }] },
  Button: { children: 'Promote' },
  Card: { children: 'A native-feeling surface with no visible stroke.' },
  Checkbox: { children: 'Include release notes' },
  Collapsible: { trigger: 'Show details', children: 'The panel follows the same spring language.' },
  Descriptions: { items: [{ label: 'Platform', value: 'React 19' }, { label: 'Runtime CSS', value: 'None to import' }] },
  DescriptionItem: { label: 'Platform', value: 'React 19' },
  EmptyState: { title: 'Nothing here yet', description: 'Create the first item to get started.' },
  Fab: { icon: '+', 'aria-label': 'Add' },
  Field: { label: 'Email', children: h(Adaptive.Input, { placeholder: 'you@example.com' }) },
  Heading: { children: 'Designed to feel at home' },
  IconButton: { children: '＋', 'aria-label': 'Add' },
  IconTile: { children: 'M', label: 'May UI' },
  Input: { placeholder: 'Native by default' },
  Kbd: { children: '⌘K' },
  Label: { children: 'Project name' },
  List: { children: h(Adaptive.ListRow, { title: 'Appearance', detail: 'Automatic' }) },
  ListRow: { title: 'Appearance', detail: 'Automatic', onClick: noop },
  Menu: { trigger: h(Adaptive.Button, {}, 'Open menu'), items: [{ label: 'Duplicate', onSelect: noop }] },
  Modal: { open: false, onClose: noop, title: 'Edit details' },
  NavigationBar: { title: 'Library', onBack: noop },
  NoticeBar: { children: 'A new May UI release is available.' },
  Pagination: { page: 2, pageCount: 6, onPageChange: noop },
  Popover: { trigger: h(Adaptive.Button, {}, 'Open popover'), children: 'Popover content' },
  Progress: { value: 64, label: 'Build progress' },
  CircularProgress: { value: 64, 'aria-label': 'Build progress' },
  RadioGroup: { defaultValue: 'one', children: options.map((option) => h(Adaptive.Radio, { key: option.value, value: option.value }, option.label)) },
  Radio: { value: 'one', children: 'One' },
  SearchField: { placeholder: 'Search components' },
  SegmentedControl: { options, defaultValue: 'one', 'aria-label': 'View' },
  Select: { options, defaultValue: 'one', 'aria-label': 'Choose an option' },
  Separator: { label: 'or' },
  Sheet: { open: false, onClose: noop, title: 'Configuration' },
  Skeleton: { width: '100%' },
  Slider: { defaultValue: 64, 'aria-label': 'Intensity' },
  Spinner: { label: 'Loading' },
  Statistic: { label: 'Components', value: 91, delta: '+12 this release' },
  Stepper: { defaultValue: 2, 'aria-label': 'Quantity' },
  Steps: { items: [{ title: 'Install' }, { title: 'Configure' }, { title: 'Ship' }], current: 1 },
  Switch: { children: 'Automatic appearance' },
  Table: { columns: [{ key: 'name', header: 'Name' }, { key: 'status', header: 'Status' }], data: [{ name: 'May UI', status: 'Ready' }], rowKey: 'name' },
  Tabs: { defaultValue: 'one', children: h(Adaptive.TabList, { 'aria-label': 'Preview tabs' }, options.map((option) => h(Adaptive.Tab, { key: option.value, value: option.value }, option.label))) },
  TabList: { children: options.map((option) => h(Adaptive.Tab, { key: option.value, value: option.value }, option.label)), 'aria-label': 'Preview tabs' },
  Tab: { value: 'one', children: 'One' },
  TabPanel: { value: 'one', children: 'Panel content' },
  Tag: { children: 'Apple-native' },
  Text: { children: 'Typography follows Apple’s named text styles.' },
  Textarea: { defaultValue: 'A comfortable writing surface.', 'aria-label': 'Notes' },
  Toast: { title: 'Changes saved', description: 'Your configuration is ready.' },
  Toolbar: { children: [h(Adaptive.Button, { key: 'a', size: 'sm' }, 'Done'), h(Adaptive.ToolbarSpacer, { key: 's' }), h(Adaptive.IconButton, { key: 'i', 'aria-label': 'More' }, '•••')] },
  Tooltip: { label: 'Create a new item', children: h(Adaptive.Button, {}, 'Hover or focus') },
  CommandPalette: { open: false, onOpenChange: noop, groups: [], hotkey: false },
  ContextMenu: { items: [{ label: 'Copy', onSelect: noop }], children: h('div', { className: 'site-context-target' }, 'Right-click target') },
  DataTable: { columns: [{ key: 'name', header: 'Name' }], data: [{ name: 'May UI' }], rowKey: 'name' },
  NavTree: { nodes: [{ id: 'components', label: 'Components', children: [{ id: 'button', label: 'Button' }] }] },
  Sidebar: { header: 'May UI', children: h(Desktop.SidebarSection, { title: 'Explore' }, h(Desktop.SidebarItem, { active: true, children: 'Components' })) },
  SidebarSection: { title: 'Explore', children: h(Desktop.SidebarItem, { active: true, children: 'Components' }) },
  SidebarItem: { active: true, children: 'Components' },
  SidebarToggle: { label: 'Toggle sidebar' },
  SplitPane: { children: [h('div', { key: 'a' }, 'Navigation'), h('div', { key: 'b' }, 'Content')] },
  CapsuleTabs: { items: options, defaultValue: 'one' },
  FloatingBubble: { children: '+', 'aria-label': 'Compose' },
  NavBar: { title: 'Inbox', onBack: noop },
  Popup: { visible: false, onClose: noop, children: 'Popup content' },
  PullToRefresh: { onRefresh: async () => {}, children: h('div', {}, 'Pull down to refresh') },
  SearchBar: { placeholder: 'Search' },
  Selector: { options, defaultValue: 'one', 'aria-label': 'Choose' },
  SwipeAction: { children: h(Adaptive.ListRow, { title: 'Swipe this row' }) },
  TabBar: { items: [{ value: 'home', label: 'Home', icon: '⌂' }, { value: 'search', label: 'Search', icon: '⌕' }], defaultValue: 'home' },
  MayProvider: { inline: true, children: h(Adaptive.Button, {}, 'Configured subtree') },
}

const modules = { adaptive: Adaptive, desktop: Desktop, mobile: Mobile } as const
const launchableOverlays = new Set(['ActionSheet', 'AlertDialog', 'CommandPalette', 'Modal', 'Popup', 'Sheet'])

function OverlayPreview({
  entry,
  Component,
  props,
}: {
  entry: CatalogEntry
  Component: ComponentType<Record<string, unknown>>
  props: Record<string, unknown>
}) {
  const [open, setOpen] = useState(false)
  const state = entry.name === 'Popup' ? { visible: open } : { open }
  const callbacks = entry.name === 'CommandPalette'
    ? { onOpenChange: setOpen }
    : { onClose: () => setOpen(false) }
  return (
    <>
      <Adaptive.Button onClick={() => setOpen(true)}>Open {entry.name}</Adaptive.Button>
      {h(Component, {
        ...props,
        ...state,
        ...callbacks,
        ...(entry.name === 'AlertDialog' ? { onConfirm: () => setOpen(false) } : {}),
      })}
    </>
  )
}

export function PreviewRenderer({
  entry,
  props = {},
}: {
  entry: CatalogEntry
  props?: Record<string, unknown>
}) {
  const Component = modules[entry.family][entry.name as keyof typeof modules[typeof entry.family]] as ComponentType<Record<string, unknown>> | undefined
  if (!Component) return <Adaptive.EmptyState title="Preview unavailable" />
  const merged = { ...(baseProps[entry.name] ?? { children: `${entry.name} preview` }), ...props }

  if (launchableOverlays.has(entry.name)) {
    return <OverlayPreview entry={entry} Component={Component} props={merged} />
  }

  if (entry.name === 'AccordionItem') {
    return <Adaptive.Accordion defaultValue={['item']}><Adaptive.AccordionItem {...merged} value="item" title="Question">Answer</Adaptive.AccordionItem></Adaptive.Accordion>
  }
  if (['Tab', 'TabList', 'TabPanel'].includes(entry.name)) {
    return <Adaptive.Tabs defaultValue="one">{h(Component, merged)}</Adaptive.Tabs>
  }
  return h(Component, merged)
}

export function VariantMatrix({ entry }: { entry: CatalogEntry }) {
  const control = entry.controls.find((item) => item.kind === 'enum' && item.options.length > 1)
  if (!control) return null
  return (
    <div className="site-variant-grid">
      {control.options.slice(0, 6).map((option) => (
        <div className="site-variant-cell" key={option}>
          <span>{control.prop}: {option}</span>
          <PreviewRenderer entry={entry} props={{ [control.prop]: option }} />
        </div>
      ))}
    </div>
  )
}

const copyDefaults: Record<string, Record<string, unknown>> = {
  Button: { children: 'Promote' },
  Badge: { children: 'New' },
  Tag: { children: 'Apple-native' },
  Text: { children: 'May UI body text' },
  Heading: { children: 'Designed to feel native' },
  Input: { placeholder: 'you@example.com' },
  Textarea: { placeholder: 'Write a note' },
  Checkbox: { children: 'Include release notes' },
  Switch: { children: 'Automatic appearance' },
  Alert: { title: 'Heads up', children: 'An inline message.' },
  Avatar: { name: 'Ada Lovelace' },
  Progress: { value: 64 },
  Spinner: { label: 'Loading' },
  Skeleton: {},
  Select: { options: [{ label: 'One', value: 'one' }] },
  SegmentedControl: { options: [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }] },
  ActionSheet: { open: true, onClose: noop, items: [{ label: 'Copy', onSelect: noop }] },
  AlertDialog: { open: true, onClose: noop, onConfirm: noop, title: 'Confirm action' },
  Breadcrumb: { items: [{ label: 'Home', href: '/' }, { label: 'Current' }] },
  DataTable: { columns: [{ key: 'name', header: 'Name' }], data: [{ id: 'one', name: 'May UI' }], rowKey: 'id' },
  Field: { label: 'Email', children: 'Control' },
  Menu: { trigger: 'Open menu', items: [{ label: 'Copy', onSelect: noop }] },
  Modal: { open: true, onClose: noop, title: 'Example modal' },
  NavTree: { nodes: [{ id: 'one', label: 'Item' }] },
  Pagination: { page: 1, pageCount: 5, onPageChange: noop },
  Popover: { trigger: 'Open popover', children: 'Popover content' },
  Sheet: { open: true, onClose: noop, title: 'Example sheet' },
  Steps: { items: [{ title: 'One' }, { title: 'Two' }], current: 0 },
  Table: { columns: [{ key: 'name', header: 'Name' }], data: [{ id: 'one', name: 'May UI' }], rowKey: 'id' },
}

const requiredValue = (name: string, type: string) => {
  if (name === 'children') return 'Content'
  if (name === 'items' || name === 'options' || name === 'groups' || name === 'nodes') return []
  if (name.startsWith('on') || type.includes('=>')) return noop
  if (type.includes('[]')) return []
  if (type.includes('boolean')) return true
  if (type.includes('number')) return 0
  return 'example'
}

export const previewCodeProps = (entry: CatalogEntry, localProps: Record<string, unknown>) => ({
  name: entry.name,
  importPath: entry.importPath,
  props: {
    ...(copyDefaults[entry.name] ?? { children: `${entry.name} example` }),
    ...Object.fromEntries(entry.props.filter((prop) => prop.required).map((prop) => [
      prop.name,
      copyDefaults[entry.name]?.[prop.name] ?? requiredValue(prop.name, prop.type),
    ])),
    ...localProps,
  },
})

export type PreviewContent = ReactNode
