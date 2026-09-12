import * as Adaptive from '../dist/mayui.js'
import * as Desktop from '../dist/desktop.js'
import * as Mobile from '../dist/mobile.js'
import * as Examples from '../dist/examples.js'

export const builtStyleEntries = {
  'mayui.js': Adaptive,
  'desktop.js': Desktop,
  'mobile.js': Mobile,
  'examples.js': Examples,
}

export function styleSheetsFor(module) {
  const sheets = new Map()
  for (const value of Object.values(module)) {
    for (const sheet of value?.__mayStyles ?? []) sheets.set(sheet.href, sheet)
  }
  return [...sheets.values()]
}

export const builtStyleSheets = (() => {
  const sheets = new Map()
  for (const module of Object.values(builtStyleEntries)) {
    for (const sheet of styleSheetsFor(module)) sheets.set(sheet.href, sheet)
  }
  return [...sheets.values()]
})()

export const builtCss = builtStyleSheets.map((sheet) => sheet.css).join('\n')
