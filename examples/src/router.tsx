import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { forwardRef, useEffect, useSyncExternalStore } from 'react'
import { legacyPath } from './lib/config-codec.mjs'

const base = import.meta.env.BASE_URL
const navigationEvent = 'may-site:navigate'

export interface RouteSnapshot {
  path: string
  search: URLSearchParams
}

const snapshot = () => ({
  path: legacyPath(window.location.pathname, base),
  search: new URLSearchParams(window.location.search),
})

let cachedKey = ''
let cachedSnapshot: RouteSnapshot = { path: '/', search: new URLSearchParams() }
const getSnapshot = () => {
  const key = `${window.location.pathname}${window.location.search}`
  if (key !== cachedKey) {
    cachedKey = key
    cachedSnapshot = snapshot()
  }
  return cachedSnapshot
}

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify)
  window.addEventListener(navigationEvent, notify)
  return () => {
    window.removeEventListener('popstate', notify)
    window.removeEventListener(navigationEvent, notify)
  }
}

const navigationSearch = (path: string) => {
  const search = new URLSearchParams(window.location.search)
  if (path !== legacyPath(window.location.pathname, base)) search.delete('props')
  const query = search.toString()
  return query ? `?${query}` : ''
}

const siteHref = (path: string, search = navigationSearch(path)) => {
  const root = base.endsWith('/') ? base.slice(0, -1) : base
  return `${root}${path === '/' ? '/' : path}${search}`
}

export function navigate(path: string, options?: { replace?: boolean; preserveSearch?: boolean }) {
  const url = siteHref(path, options?.preserveSearch === false ? '' : navigationSearch(path))
  window.history[options?.replace ? 'replaceState' : 'pushState']({}, '', url)
  window.dispatchEvent(new Event(navigationEvent))
}

export function replaceSearch(search: URLSearchParams) {
  const query = search.toString()
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  window.dispatchEvent(new Event(navigationEvent))
}

export function useRoute(): RouteSnapshot {
  const route = useSyncExternalStore(subscribe, getSnapshot, () => cachedSnapshot)
  useEffect(() => {
    const legacy = legacyPath(window.location.pathname, base)
    const canonical = siteHref(legacy)
    if (`${window.location.pathname}${window.location.search}` !== canonical) {
      window.history.replaceState({}, '', canonical)
    }
  }, [])
  return route
}

export interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  children?: ReactNode
}

export const SiteLink = forwardRef<HTMLAnchorElement, SiteLinkProps>(function SiteLink(
  { href, onClick, children, ...props },
  ref,
) {
  const resolved = href.startsWith('/') ? siteHref(href) : href
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || !href.startsWith('/')) return
    event.preventDefault()
    navigate(href)
  }
  return <a {...props} ref={ref} href={resolved} onClick={click}>{children}</a>
})
