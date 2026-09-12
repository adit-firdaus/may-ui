/**
 * Server-renders every exported component against the BUILT bundles and
 * asserts what a screenshot cannot show: that each one renders at all, emits
 * its data-slot, and wires the accessibility roles it claims.
 *
 * Components needing required props declare them in PROPS; everything else is
 * rendered bare. A component that throws when rendered bare is a real finding
 * — it means a prop the type system marks optional is actually load-bearing.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h, Fragment } from 'react'
import * as Adaptive from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'

const noop = () => {}
const OPTS = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
]

/** Props for components that genuinely require them. */
const PROPS = {
  // adaptive
  IconButton: { icon: 'x', 'aria-label': 'Close' },
  Field: { label: 'Email', children: h(Adaptive.Input, {}) },
  Label: { children: 'Name' },
  Select: { options: OPTS, 'aria-label': 'Pick' },
  RadioGroup: { 'aria-label': 'Pick', children: h(Adaptive.Radio ?? 'span', { value: 'one' }, 'One') },
  SegmentedControl: { options: OPTS, 'aria-label': 'View' },
  Slider: { 'aria-label': 'Volume' },
  Sheet: { open: true, onClose: noop, title: 'Sheet' },
  Modal: { open: true, onClose: noop, title: 'Modal' },
  AlertDialog: { open: true, onClose: noop, onConfirm: noop, title: 'Delete?' },
  ActionSheet: { open: true, onClose: noop, actions: [{ label: 'Copy', onSelect: noop }] },
  Popover: { open: true, content: 'hi', children: h('button', {}, 'trigger') },
  Tooltip: { content: 'hint', children: h('button', {}, 'trigger') },
  Menu: { open: true, items: [{ label: 'Copy', onSelect: noop }], children: h('button', {}, 'trigger') },
  Toast: { title: 'Saved' },
  Tabs: { defaultValue: 'one', children: null },
  Tab: { value: 'one', children: 'One' },
  TabPanel: { value: 'one', children: 'panel' },
  TabList: { 'aria-label': 'Tabs', children: null },
  Breadcrumb: { items: [{ label: 'Home', href: '#' }, { label: 'Now' }] },
  Pagination: { page: 1, pageCount: 5, onPageChange: noop },
  Steps: { items: [{ title: 'One' }, { title: 'Two' }], current: 0 },
  Table: { columns: [{ key: 'a', header: 'A' }], data: [{ a: 1 }], rowKey: 'a' },
  ListRow: { title: 'Row' },
  Progress: { value: 50, 'aria-label': 'Progress' },
  CircularProgress: { value: 50, 'aria-label': 'Progress' },
  Statistic: { label: 'Users', value: '1,284' },
  IconTile: { gradient: 'blue' },
  Avatar: { name: 'Ada Lovelace' },
  Descriptions: { items: [{ label: 'Model', value: 'A2650' }] },
  DescriptionItem: { label: 'Model', value: 'A2650' },
  Accordion: { children: null },
  AccordionItem: { value: 'a', title: 'Q', children: 'A' },
  Collapsible: { trigger: 'More', children: 'body' },
  Alert: { title: 'Heads up' },
  NoticeBar: { children: 'Notice' },
  EmptyState: { title: 'Nothing here' },
  Text: { children: 'Body copy' },
  Heading: { children: 'Title' },
  Kbd: { children: 'K' },
  Badge: { children: 'New' },
  Tag: { children: 'tag' },
  Card: { children: 'card' },
  Button: { children: 'Go' },
  Fab: { 'aria-label': 'Add', icon: '+' },
  NavigationBar: { title: 'Settings' },
  Stepper: { value: 1, onValueChange: noop, 'aria-label': 'Qty' },
  SearchField: { 'aria-label': 'Search' },
  // desktop
  NavTree: { nodes: [{ id: 'a', label: 'A' }] },
  SplitPane: { children: [h('div', { key: 1 }, 'a'), h('div', { key: 2 }, 'b')] },
  DataTable: { columns: [{ key: 'a', header: 'A' }], data: [{ a: 1 }], rowKey: 'a' },
  CommandPalette: { open: true, onOpenChange: noop, hotkey: false, groups: [{ id: 'g1', heading: 'Actions', items: [{ id: 'a', label: 'Open' }] }] },
  ContextMenu: { items: [{ label: 'Copy', onSelect: noop }], children: h('div', {}, 'target') },
  // mobile
  TabBar: { items: [{ value: 'h', label: 'Home', icon: 'H' }], value: 'h', onValueChange: noop },
  NavBar: { title: 'Inbox' },
  CapsuleTabs: { items: [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }], 'aria-label': 'Filter' },
  Popup: { visible: true, onClose: noop, children: 'body' },
  SearchBar: { 'aria-label': 'Search' },
  Selector: { options: OPTS, 'aria-label': 'Pick' },
  // Compound children legitimately throw outside their parent — render them in context.
  PullToRefresh: { onRefresh: async () => {}, children: h('div', {}, 'content') },
  SwipeAction: { children: h(Adaptive.ListRow ?? 'div', { title: 'Row' }) },
  FloatingBubble: { children: '+', 'aria-label': 'Compose' },
}

/**
 * Components that only make sense inside a parent. Rendering them bare throws
 * a deliberate, helpful error — that is correct behaviour, not a defect — so
 * they are exercised in context instead.
 */
const CONTEXT = {
  AccordionItem: () =>
    h(Adaptive.Accordion, { defaultValue: ['a'] }, h(Adaptive.AccordionItem, { value: 'a', title: 'Q' }, 'A')),
  Tab: () => h(Adaptive.Tabs, { defaultValue: 'one' }, h(Adaptive.TabList, { 'aria-label': 'T' }, h(Adaptive.Tab, { value: 'one' }, 'One'))),
  TabList: () => h(Adaptive.Tabs, { defaultValue: 'one' }, h(Adaptive.TabList, { 'aria-label': 'T' }, h(Adaptive.Tab, { value: 'one' }, 'One'))),
  TabPanel: () => h(Adaptive.Tabs, { defaultValue: 'one' }, h(Adaptive.TabPanel, { value: 'one' }, 'panel')),
  Sidebar: () =>
    h(
      Desktop.Sidebar,
      { header: 'App' },
      h(Desktop.SidebarSection, { title: 'Main' }, h(Desktop.SidebarItem, { icon: 'H' }, 'Home')),
    ),
  SidebarSection: () =>
    h(Desktop.Sidebar, {}, h(Desktop.SidebarSection, { title: 'Main' }, h(Desktop.SidebarItem, {}, 'Home'))),
  SidebarItem: () => h(Desktop.Sidebar, {}, h(Desktop.SidebarItem, { icon: 'H' }, 'Home')),
}

const isComponent = (v) =>
  typeof v === 'function' ||
  (typeof v === 'object' && v !== null && ('$$typeof' in v))

function collect(mod, family) {
  return Object.entries(mod)
    .filter(([name, v]) => /^[A-Z]/.test(name) && isComponent(v))
    .map(([name, Comp]) => ({ name, Comp, family }))
}

const targets = [
  ...collect(Adaptive, 'adaptive'),
  ...collect(Desktop, 'desktop'),
  ...collect(Mobile, 'mobile'),
]

const failures = []
const rendered = []

for (const { name, Comp, family } of targets) {
  if (name === 'MayProvider' || name === 'MayHost') continue
  try {
    const node = CONTEXT[name] ? CONTEXT[name]() : h(Comp, PROPS[name] ?? {})
    const html = renderToStaticMarkup(h(Adaptive.MayProvider, { theme: { mode: 'light' } }, node))
    const body = html.replace(/^.*?may-root[^>]*>/, '')
    rendered.push({ name, family, html: body, hasSlot: /data-slot="/.test(body), empty: body.replace(/<\/div>$/, '').trim() === '' })
  } catch (err) {
    failures.push({ name, family, error: String(err.message ?? err).split('\n')[0].slice(0, 160) })
  }
}

console.log(`exports scanned: adaptive ${collect(Adaptive, 'a').length}, desktop ${collect(Desktop, 'd').length}, mobile ${collect(Mobile, 'm').length}`)
console.log(`rendered: ${rendered.length}/${targets.length - 1}`)

if (failures.length) {
  console.log(`\nRENDER FAILURES (${failures.length}):`)
  for (const f of failures) console.log(`  [${f.family}] ${f.name}: ${f.error}`)
}

const noSlot = rendered.filter((r) => !r.hasSlot && !r.empty)
if (noSlot.length) {
  console.log(`\nMISSING data-slot (${noSlot.length}):`)
  console.log('  ' + noSlot.map((r) => r.name).join(', '))
}

const emptyRender = rendered.filter((r) => r.empty)
if (emptyRender.length) {
  console.log(`\nRENDERED EMPTY (${emptyRender.length}) — may be correct for closed overlays:`)
  console.log('  ' + emptyRender.map((r) => r.name).join(', '))
}

const renderFailed = failures.length + noSlot.length

/* ------------------------------------------------------------------ *
 * Accessibility and contract assertions
 *
 * These are the things that break silently: a role that never made it onto
 * the element, a dialog that does not announce itself as modal, an activatable
 * row that is a div. None of them show up in a screenshot.
 * ------------------------------------------------------------------ */

const html = (name, props) =>
  renderToStaticMarkup(
    h(Adaptive.MayProvider, { theme: { mode: 'light' } }, CONTEXT[name] ? CONTEXT[name]() : h(
      Adaptive[name] ?? Desktop[name] ?? Mobile[name],
      props ?? PROPS[name] ?? {},
    )),
  )

const assertions = [
  ['Sheet announces itself as a modal dialog', () => /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"/.test(html('Sheet'))],
  ['Modal announces itself as a modal dialog', () => /aria-modal="true"/.test(html('Modal'))],
  ['AlertDialog announces itself as a modal dialog', () => /aria-modal="true"/.test(html('AlertDialog'))],
  ['Slider exposes value/min/max to assistive tech', () => {
    const s = html('Slider')
    return /role="slider"/.test(s) && /aria-valuenow=/.test(s) && /aria-valuemin=/.test(s) && /aria-valuemax=/.test(s)
  }],
  ['Tabs wires tablist / tab / tabpanel', () => {
    const s = renderToStaticMarkup(h(Adaptive.MayProvider, {}, h(Adaptive.Tabs, { defaultValue: 'one' },
      h(Adaptive.TabList, { 'aria-label': 'T' }, h(Adaptive.Tab, { value: 'one' }, 'One')),
      h(Adaptive.TabPanel, { value: 'one' }, 'panel'))))
    return /role="tablist"/.test(s) && /role="tab"/.test(s) && /role="tabpanel"/.test(s) && /aria-controls=/.test(s)
  }],
  ['SegmentedControl is a tablist with a selected tab', () => {
    const s = html('SegmentedControl')
    return /role="tablist"/.test(s) && /aria-selected="true"/.test(s)
  }],
  ['Progress exposes progressbar semantics', () => /role="progressbar"/.test(html('Progress'))],
  ['IconButton keeps its accessible name', () => /aria-label="Close"/.test(html('IconButton'))],
  ['Checkbox is a real input', () => /<input[^>]*type="checkbox"/.test(html('Checkbox'))],
  ['Switch is a real input with switch semantics', () => {
    const s = html('Switch')
    return /<input/.test(s) && /role="switch"|type="checkbox"/.test(s)
  }],
  ['an activatable ListRow is a real button', () => /<button[^>]*data-slot="list-row"/.test(
    renderToStaticMarkup(h(Adaptive.MayProvider, {}, h(Adaptive.List, {}, h(Adaptive.ListRow, { title: 'R', onClick: () => {} })))))],
  ['Table renders a real table at desktop width (SSR resolves desktop)', () => /<table/.test(html('Table'))],
  ['Menu exposes menu semantics', () => /role="menu"/.test(html('Menu'))],
  ['Toast announces politely or assertively', () => /role="(status|alert)"/.test(html('Toast'))],
  ['Alert announces politely or assertively', () => /role="(status|alert)"/.test(html('Alert'))],
  ['TabBar is a navigation landmark', () => /<nav/.test(html('TabBar'))],
  ['NavigationBar emits its slot for the native-feel CSS', () => /data-slot="nav-bar"/.test(html('NavigationBar'))],
  ['Accordion wires expanded/controls', () => {
    const s = html('AccordionItem')
    return /aria-expanded=/.test(s) && /aria-controls=/.test(s)
  }],
  ['Field links its label to the control', () => {
    const s = html('Field')
    const m = s.match(/<label[^>]*for="([^"]+)"/)
    return !!m && new RegExp(`id="${m[1]}"`).test(s)
  }],
  ['Field marks the control invalid from its error prop', () => {
    const s = renderToStaticMarkup(h(Adaptive.MayProvider, {}, h(Adaptive.Field, { label: 'E', error: 'Bad' }, h(Adaptive.Input, {}))))
    return /aria-invalid="true"/.test(s) && /aria-describedby=/.test(s)
  }],
  ['VisuallyHidden actually hides visually', () => /may-sr-only/.test(html('VisuallyHidden', { children: 'x' }))],
  ['ScrollArea opts into the scrollbar + overscroll rules', () => /data-slot="scroll-area"/.test(html('ScrollArea', { children: 'x' }))],
]

let failed = 0
console.log('')
for (const [label, fn] of assertions) {
  let ok = false
  try { ok = fn() } catch (e) { ok = false }
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) failed++
}

process.exit(failed + renderFailed ? 1 : 0)
