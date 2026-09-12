import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { withCustomConfig } from 'react-docgen-typescript'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const source = (path) => readFileSync(resolve(root, path), 'utf8')
const slug = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const plain = (value) => value.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
const dedicatedCategories = {
  CommandPalette: 'Overlays', ContextMenu: 'Overlays', DataTable: 'Data display',
  NavTree: 'Navigation', Sidebar: 'Navigation', SidebarItem: 'Navigation',
  SidebarSection: 'Navigation', SidebarToggle: 'Navigation', SplitPane: 'Layout',
  CapsuleTabs: 'Navigation', FloatingBubble: 'Interaction', NavBar: 'Navigation',
  Popup: 'Overlays', PullToRefresh: 'Interaction', SearchBar: 'Forms',
  Selector: 'Forms', SwipeAction: 'Interaction', TabBar: 'Navigation',
}

function valueExports(indexPath) {
  const file = resolve(root, indexPath)
  const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const names = []
  for (const node of ast.statements) {
    if (!ts.isExportDeclaration(node) || node.isTypeOnly || !node.exportClause ||
      !ts.isNamedExports(node.exportClause)) continue
    for (const element of node.exportClause.elements) {
      if (!element.isTypeOnly && /^[A-Z]/.test(element.name.text)) names.push(element.name.text)
    }
  }
  for (const node of ast.statements) {
    if (!ts.isVariableStatement(node) || !node.modifiers?.some((item) => item.kind === ts.SyntaxKind.ExportKeyword)) continue
    for (const declaration of node.declarationList.declarations) {
      const name = declaration.name.getText(ast)
      if (/^[A-Z]/.test(name)) names.push(name)
    }
  }
  return [...new Set(names)]
}

function entryDirectories(entryPath, family) {
  const lines = source(entryPath).split('\n')
  let category = family === 'adaptive' ? 'Foundation' : family === 'desktop' ? 'Desktop' : 'Mobile'
  const directories = []
  for (const line of lines) {
    const heading = line.match(/^\/\/ ([A-Z][\w ]+)$/)
    if (heading && family === 'adaptive') category = heading[1]
    const match = line.match(/^export \* from '(\.\/[^']+)'/)
    if (!match || (family === 'adaptive' && !match[1].startsWith('./components/'))) continue
    const directory = resolve(root, dirname(entryPath), match[1])
    const relative = directory.slice(root.length + 1)
    directories.push({ family, category, directory: relative, index: `${relative}/index.ts` })
  }
  return directories
}

const directories = [
  ...entryDirectories('src/index.ts', 'adaptive'),
  ...entryDirectories('src/desktop.ts', 'desktop'),
  ...entryDirectories('src/mobile.ts', 'mobile'),
]

const configurable = {}
const configBody = source('src/config/types.ts').match(/export interface MayComponentDefaults \{([\s\S]*?)\n\}/)?.[1] ?? ''
for (const line of configBody.split('\n')) {
  const match = line.match(/^\s+(\w+)\?: Defaults<.*?,\s*([^>]+)>/)
  if (!match) continue
  configurable[match[1]] = [...match[2].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

const files = directories.map(({ directory }) => {
  const name = directory.split('/').at(-1)
  return resolve(root, directory, `${name}.tsx`)
})

const parser = withCustomConfig(resolve(root, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
})
const docs = new Map(parser.parse(files).map((doc) => [doc.displayName, doc]))

const ownProp = (prop) => prop.parent?.fileName && !prop.parent.fileName.includes('node_modules')
const enumOptions = (type) => type.name === 'enum'
  ? (type.value ?? []).map((option) => String(option.value).replace(/^['"]|['"]$/g, ''))
  : []
const primitiveKind = (type) => {
  if (type.name === 'boolean') return 'boolean'
  if (type.name === 'number') return 'number'
  if (type.name === 'string') return 'string'
  if (type.name === 'enum' && enumOptions(type).length) return 'enum'
  return null
}
const parseDefault = (value, kind) => {
  if (!value) return undefined
  if (kind === 'boolean') return value.value === 'true'
  if (kind === 'number') return Number(value.value)
  return String(value.value).replace(/^['"]|['"]$/g, '')
}
const localControls = new Set([
  'disabled', 'loading', 'invalid', 'open', 'compact', 'fixed', 'showValue',
  'multiple', 'checked', 'dismissible', 'closeButton', 'fullWidth',
])

const catalog = []
for (const item of directories) {
  const componentName = item.directory.split('/').at(-1)
  for (const name of valueExports(item.index)) {
    if (name === 'PlatformProvider' || name === 'MayHost') continue
    const doc = docs.get(name)
    const props = Object.values(doc?.props ?? {})
      .filter(ownProp)
      .map((prop) => ({
        name: prop.name,
        description: prop.description ?? '',
        required: prop.required,
        type: prop.type.raw ?? prop.type.name,
        defaultValue: prop.defaultValue?.value ?? null,
      }))
    const configurableProps = new Set(configurable[name] ?? [])
    const controls = Object.values(doc?.props ?? {})
      .filter((prop) => ownProp(prop) && (configurableProps.has(prop.name) || localControls.has(prop.name)))
      .map((prop) => {
        const kind = primitiveKind(prop.type)
        if (!kind) return null
        return {
          prop: prop.name,
          kind,
          options: enumOptions(prop.type),
          defaultValue: parseDefault(prop.defaultValue, kind) ?? null,
          providerDefault: configurableProps.has(prop.name),
          description: prop.description ?? '',
        }
      })
      .filter(Boolean)
    catalog.push({
      name,
      slug: slug(name),
      family: item.family,
      category: dedicatedCategories[name] ?? item.category,
      description: plain(doc?.description?.split('\n\n')[0] || `${name} from May UI's ${item.family} family.`),
      importPath: item.family === 'adaptive'
        ? '@adit_firdaus/may-ui'
        : `@adit_firdaus/may-ui/${item.family}`,
      source: `${item.directory}/${componentName}.tsx`,
      props,
      controls,
      related: [],
    })
  }
}

catalog.sort((left, right) => left.family.localeCompare(right.family) || left.name.localeCompare(right.name))
const output = resolve(root, 'examples/src/generated/catalog.json')
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(catalog, null, 2)}\n`)
writeFileSync(
  resolve(root, 'examples/src/generated/catalog-index.json'),
  `${JSON.stringify(catalog.map(({ props: _props, source: _source, related: _related, ...entry }) => entry), null, 2)}\n`,
)
writeFileSync(
  resolve(root, 'examples/src/generated/catalog-search.json'),
  `${JSON.stringify(catalog.map(({ name, slug, family, category }) => ({ name, slug, family, category })), null, 2)}\n`,
)
writeFileSync(
  resolve(root, 'examples/src/generated/config-schema.json'),
  `${JSON.stringify(Object.fromEntries(catalog.map(({ name, controls }) => [
    name,
    controls.filter((control) => control.providerDefault)
      .map(({ prop, kind }) => ({ prop, kind })),
  ])), null, 2)}\n`,
)
console.log(`wrote ${catalog.length} component entries to examples/src/generated/catalog.json`)
