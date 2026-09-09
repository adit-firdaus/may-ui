import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h } from 'react'
import * as May from '../dist/mayui.js'

const P = (children) => h(May.MayProvider, { theme: 'light' }, children)
const render = (el) => renderToStaticMarkup(P(el))

const cases = {
  Box: h(May.Box, { padding: 4, surface: 'base', radius: 'lg', bordered: true }, 'box'),
  Stack: h(May.Stack, { direction: 'horizontal', gap: 3 }, 'a', 'b'),
  Grid: h(May.Grid, { columns: 3, gap: 4 }, 'a'),
  Divider: h(May.Divider, null),
  DividerLabelled: h(May.Divider, null, 'or'),
  Heading: h(May.Heading, { level: 1 }, 'Title'),
  Text: h(May.Text, { tone: 'muted', clamp: 2 }, 'body'),
  Button: h(May.Button, { tone: 'danger', variant: 'soft', size: 'lg' }, 'Delete'),
  ButtonLoading: h(May.Button, { loading: true }, 'Saving'),
  IconButton: h(May.IconButton, { icon: 'x', 'aria-label': 'Close' }),
  ButtonGroup: h(May.ButtonGroup, null, h(May.Button, null, 'A'), h(May.Button, null, 'B')),
  Field: h(May.Field, { label: 'Email', error: 'Bad email', required: true }, h(May.Input, { fullWidth: true })),
  FieldOk: h(May.Field, { label: 'Email', description: 'help' }, h(May.Input, null)),
  Input: h(May.Input, { prefix: 'search', suffix: 'USD', size: 'sm' }),
  Textarea: h(May.Textarea, { rows: 3, resize: 'none' }),
  Select: h(May.Select, { placeholder: 'Pick', options: [{ label: 'A', value: 'a' }] }),
  Checkbox: h(May.Checkbox, { description: 'desc', defaultChecked: true }, 'Label'),
  RadioGroup: h(May.RadioGroup, { defaultValue: 'a', 'aria-label': 'g' }, h(May.Radio, { value: 'a' }, 'A'), h(May.Radio, { value: 'b' }, 'B')),
  Switch: h(May.Switch, { defaultChecked: true, description: 'd' }, 'Toggle'),
  Card: h(May.Card, { variant: 'raised' }, h(May.CardHeader, null, h(May.CardTitle, null, 'T'), h(May.CardDescription, null, 'D')), h(May.CardBody, null, 'body'), h(May.CardFooter, null, 'f')),
  Badge: h(May.Badge, { tone: 'success', dot: true }, 'Live'),
  Tag: h(May.Tag, { tone: 'brand', onRemove: () => {} }, 'react'),
  Avatar: h(May.Avatar, { name: 'Ada Lovelace' }),
  AvatarGroup: h(May.AvatarGroup, { max: 2 }, h(May.Avatar, { name: 'A B' }), h(May.Avatar, { name: 'C D' }), h(May.Avatar, { name: 'E F' })),
  Table: h(May.Table, { striped: true, hoverable: true }, h(May.TableHead, null, h(May.TableRow, null, h(May.TableHeaderCell, null, 'H'), h(May.TableHeaderCell, { numeric: true }, 'N'))), h(May.TableBody, null, h(May.TableRow, { selected: true }, h(May.TableCell, null, 'c'), h(May.TableCell, { numeric: true }, '42')))),
  Alert: h(May.Alert, { tone: 'danger', title: 'Failed', onDismiss: () => {} }, 'msg'),
  Progress: h(May.Progress, { value: 64, showValue: true, 'aria-label': 'p' }),
  ProgressIndet: h(May.Progress, { 'aria-label': 'p' }),
  Spinner: h(May.Spinner, { size: 'lg' }),
  Skeleton: h(May.Skeleton, { variant: 'text', lines: 3 }),
  Tabs: h(May.Tabs, { defaultValue: 'a' }, h(May.TabList, { 'aria-label': 't' }, h(May.Tab, { value: 'a' }, 'A'), h(May.Tab, { value: 'b' }, 'B')), h(May.TabPanel, { value: 'a' }, 'panel a')),
  Accordion: h(May.Accordion, { defaultValue: ['x'] }, h(May.AccordionItem, { value: 'x', title: 'Q', description: 'd' }, 'answer')),
  Breadcrumb: h(May.Breadcrumb, { items: [{ label: 'Home', href: '#' }, { label: 'Now' }] }),
  BreadcrumbCollapsed: h(May.Breadcrumb, { maxItems: 3, items: [1,2,3,4,5].map(n => ({ label: 'p'+n, href: '#' })) }),
  Pagination: h(May.Pagination, { page: 23, pageCount: 50, onPageChange: () => {} }),
  Tooltip: h(May.Tooltip, { content: 'hint', open: true }, h(May.Button, null, 'Hover')),
  ModalClosed: h(May.Modal, { open: false, onClose: () => {} }, 'x'),
  DrawerClosed: h(May.Drawer, { open: false, onClose: () => {} }, 'x'),
  Toast: h(May.Toast, { title: 'Saved', description: 'd', tone: 'success', action: { label: 'Undo', onClick: () => {} }, onDismiss: () => {} }),
  ToastProvider: h(May.ToastProvider, null, 'app'),
}

let pass = 0
const failures = []
for (const [name, el] of Object.entries(cases)) {
  try {
    const html = render(el)
    if (!html.includes('may-')) throw new Error('no may-* class in output')
    pass++
  } catch (err) {
    failures.push(`${name}: ${err.message}`)
  }
}

console.log(`exports: ${Object.keys(May).length}`)
console.log(`rendered: ${pass}/${Object.keys(cases).length}`)
if (failures.length) {
  console.log('FAILURES:')
  failures.forEach((f) => console.log('  ' + f))
  process.exit(1)
}

// Spot-check a11y wiring that matters
const fieldHtml = render(cases.Field)
const checks = [
  ['Field marks control invalid', /aria-invalid="true"/.test(fieldHtml)],
  ['Field wires aria-describedby to the error', /aria-describedby="[^"]*-error"/.test(fieldHtml)],
  ['Field links label to control', /<label[^>]*for="([^"]+)"/.test(fieldHtml) && new RegExp(`id="${fieldHtml.match(/<label[^>]*for="([^"]+)"/)[1]}"`).test(fieldHtml)],
  ['IconButton keeps its aria-label', /aria-label="Close"/.test(render(cases.IconButton))],
  ['Tabs wires aria-controls', /aria-controls="[^"]*-panel-a"/.test(render(cases.Tabs))],
  ['Accordion wires aria-expanded', /aria-expanded="true"/.test(render(cases.Accordion))],
  ['Closed Modal renders nothing', render(cases.ModalClosed).indexOf('may-modal') === -1],
  ['Pagination collapses with an ellipsis', render(cases.Pagination).includes('may-pagination__ellipsis')],
  ['Avatar derives initials', render(cases.Avatar).includes('>AL<')],
  ['Progress exposes aria-valuenow', /aria-valuenow="64"/.test(render(cases.Progress))],
  ['Indeterminate Progress omits valuenow', !/aria-valuenow/.test(render(cases.ProgressIndet))],
]
let bad = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) bad++
}
process.exit(bad ? 1 : 0)
