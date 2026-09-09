/**
 * Server-renders every export against the BUILT bundle and asserts the things
 * that are easy to break and invisible in a screenshot: accessibility wiring,
 * the data-slot contract, and the native-feel attributes.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h } from 'react'
import * as May from '../dist/mayui.js'

const render = (el) => renderToStaticMarkup(h(May.MayProvider, { theme: 'light' }, el))

const cases = {
  Button: h(May.Button, null, 'Continue'),
  ButtonTinted: h(May.Button, { variant: 'tinted', tone: 'danger', size: 'lg', pill: true }, 'Delete'),
  ButtonLoading: h(May.Button, { loading: true }, 'Saving'),
  List: h(
    May.List,
    { header: 'General', footer: 'Applies to this device only.' },
    h(May.ListRow, { title: 'Airplane Mode', accessory: 'x' }),
    h(May.ListRow, { title: 'Wi-Fi', detail: 'HomeNet', onClick: () => {} }),
    h(May.ListRow, { title: 'Delete Account', destructive: true, onClick: () => {} }),
  ),
  SegmentedControl: h(May.SegmentedControl, {
    'aria-label': 'View',
    options: [
      { label: 'Day', value: 'd' },
      { label: 'Week', value: 'w' },
    ],
  }),
  SheetOpen: h(May.Sheet, { open: true, onClose: () => {}, title: 'Share', description: 'Pick one' }, 'body'),
  SheetClosed: h(May.Sheet, { open: false, onClose: () => {} }, 'body'),
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

const listHtml = render(cases.List)
const sheetHtml = render(cases.SheetOpen)
const segHtml = render(cases.SegmentedControl)
const btnHtml = render(cases.Button)

const checks = [
  ['every root emits data-slot', /data-slot="root"/.test(btnHtml) && /data-slot="button"/.test(btnHtml)],
  ['Button emits data-variant and data-size', /data-variant="filled"/.test(btnHtml) && /data-size="md"/.test(btnHtml)],
  ['Button is pressable and hoverable', /may-pressable/.test(btnHtml) && /may-hoverable/.test(btnHtml)],
  ['an activatable ListRow is a real <button>', /<button[^>]*data-slot="list-row"/.test(listHtml)],
  ['a static ListRow is NOT a button', /<div[^>]*data-slot="list-row"/.test(listHtml)],
  ['destructive row is marked', /data-destructive="true"/.test(listHtml)],
  ['List header and footer render', /General/.test(listHtml) && /this device only/.test(listHtml)],
  ['SegmentedControl is a tablist with a thumb', /role="tablist"/.test(segHtml) && /may-segmented__thumb/.test(segHtml)],
  ['SegmentedControl marks selection', /aria-selected="true"/.test(segHtml)],
  ['Sheet is a modal dialog', /role="dialog"/.test(sheetHtml) && /aria-modal="true"/.test(sheetHtml)],
  ['Sheet labels itself from its title', /aria-labelledby="[^"]*-title"/.test(sheetHtml)],
  ['Sheet SSRs as the desktop dialog shape', /data-presentation="dialog"/.test(sheetHtml)],
  ['Sheet body is a scroll-area (gets the scrollbar + overscroll rules)', /data-slot="scroll-area"/.test(sheetHtml)],
  ['closed Sheet renders nothing', render(cases.SheetClosed).indexOf('may-sheet') === -1],
]

let bad = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) bad++
}
process.exit(bad ? 1 : 0)
