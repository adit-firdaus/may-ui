const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const bytesToBase64 = (bytes) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const base64ToBytes = (value) => {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export const stableStringify = (value) => JSON.stringify(value, (_key, item) => {
  if (!item || Array.isArray(item) || typeof item !== 'object') return item
  return Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]]))
})

export function encodeState(value) {
  return bytesToBase64(textEncoder.encode(stableStringify(value)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '')
}

export function decodeState(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  return JSON.parse(textDecoder.decode(base64ToBytes(padded)))
}

const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
  ? value
  : null

export function resolveInitialState(linked, stored, defaults, validate = (value) => asObject(value)) {
  if (linked) {
    try {
      const value = decodeState(linked)
      if (validate(value)) return value
    } catch {}
  }
  if (stored) {
    try {
      const value = JSON.parse(stored)
      if (validate(value)) return value
    } catch {}
  }
  return defaults
}

export function legacyPath(pathname, base = '/') {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  let path = pathname.startsWith(normalizedBase)
    ? `/${pathname.slice(normalizedBase.length)}`
    : pathname
  if (path === '/docs' || path === '/docs/' || path === '/docs/index.html') {
    return '/docs/getting-started'
  }
  path = path.replace(/^\/docs\/([^/]+)\.html$/, '/docs/$1')
  return path === '' ? '/' : path
}

const quote = (value) => `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

function objectCode(value) {
  if (Array.isArray(value)) return `[${value.map(objectCode).join(', ')}]`
  if (value && typeof value === 'object') {
    return `{ ${Object.entries(value).map(([key, item]) => `${key}: ${objectCode(item)}`).join(', ')} }`
  }
  if (typeof value === 'string') return quote(value)
  return String(value)
}

function componentCode(component) {
  const props = { ...(component.props ?? {}) }
  const children = props.children
  delete props.children
  const attributes = Object.entries(props).map(([name, value]) => {
    if (value === true) return name
    if (typeof value === 'string') return `${name}="${value.replaceAll('"', '&quot;')}"`
    return `${name}={${objectCode(value)}}`
  })
  const opening = attributes.length ? `<${component.name} ${attributes.join(' ')}>` : `<${component.name}>`
  if (children === undefined) return opening.replace(/>$/, ' />')
  return `${opening}${String(children)}</${component.name}>`
}

export function generateReactCode(config, component) {
  const isProvider = component.name === 'MayProvider'
  const configured = !isProvider && Object.keys(config ?? {}).length > 0
  const rendered = isProvider
    ? { ...component, props: { ...config, ...component.props } }
    : component
  const imports = [...new Set([component.name, ...(configured ? ['MayProvider'] : [])])].join(', ')
  const lines = [`import { ${imports} } from '${component.importPath}'`, '', 'export function Example() {', '  return (']
  const renderedComponent = componentCode(rendered)
  if (!configured) lines.push(`    ${renderedComponent}`)
  else {
    const providerProps = Object.entries(config).map(([name, value]) => `${name}={${objectCode(value)}}`)
    lines.push(`    <MayProvider ${providerProps.join(' ')}>`, `      ${renderedComponent}`, '    </MayProvider>')
  }
  lines.push('  )', '}')
  return lines.join('\n')
}

const typeMatches = (value, type) => {
  if (type === 'boolean') return typeof value === 'boolean'
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value)
  return typeof value === 'string' || typeof value === 'number'
}

export function validateSiteConfig(input, schema) {
  const errors = []
  const value = asObject(input)
  if (!value) return { ok: false, value: null, errors: ['Configuration must be an object'] }
  const allowedTop = new Set(['theme', 'components', 'platform', 'host'])
  for (const key of Object.keys(value)) if (!allowedTop.has(key)) errors.push(`Unknown configuration key: ${key}`)

  if (value.platform !== undefined && !['auto', 'phone', 'desktop'].includes(value.platform)) {
    errors.push('platform must be auto, phone, or desktop')
  }

  if (value.theme !== undefined) {
    const theme = asObject(value.theme)
    if (!theme) errors.push('theme must be an object')
    else {
      if (theme.mode !== undefined && !['system', 'light', 'dark'].includes(theme.mode)) {
        errors.push('theme.mode must be system, light, or dark')
      }
      for (const tier of ['tokens', 'light', 'dark']) {
        if (theme[tier] === undefined) continue
        const tokens = asObject(theme[tier])
        if (!tokens) errors.push(`theme.${tier} must be an object`)
        else for (const [name, token] of Object.entries(tokens)) {
          if (!schema.tokens.has(name)) errors.push(`Unknown token: ${name}`)
          else if (!['string', 'number'].includes(typeof token)) errors.push(`${name} must be a string or number`)
        }
      }
    }
  }

  if (value.components !== undefined) {
    const components = asObject(value.components)
    if (!components) errors.push('components must be an object')
    else for (const [name, defaults] of Object.entries(components)) {
      const controls = schema.components[name]
      if (!controls) {
        errors.push(`Unknown configurable component: ${name}`)
        continue
      }
      const record = asObject(defaults)
      if (!record) {
        errors.push(`components.${name} must be an object`)
        continue
      }
      for (const [prop, propValue] of Object.entries(record)) {
        const control = controls[prop]
        if (!control) errors.push(`Unknown provider default: ${name}.${prop}`)
        else if (!typeMatches(propValue, control.type)) errors.push(`${name}.${prop} has the wrong type`)
      }
    }
  }

  if (value.host !== undefined && value.host !== false) {
    const host = asObject(value.host)
    if (!host) errors.push('host must be false or an object')
    else {
      const allowedHost = new Set(['position', 'max', 'duration', 'closeLabel', 'label'])
      for (const key of Object.keys(host)) if (!allowedHost.has(key)) errors.push(`Unknown host option: ${key}`)
      if (host.position !== undefined && ![
        'top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end',
      ].includes(host.position)) errors.push('host.position is invalid')
      for (const key of ['max', 'duration']) {
        if (host[key] !== undefined && (typeof host[key] !== 'number' || !Number.isFinite(host[key]))) {
          errors.push(`host.${key} must be a number`)
        }
      }
      for (const key of ['closeLabel', 'label']) {
        if (host[key] !== undefined && typeof host[key] !== 'string') errors.push(`host.${key} must be a string`)
      }
    }
  }
  return { ok: errors.length === 0, value: errors.length ? null : value, errors }
}
