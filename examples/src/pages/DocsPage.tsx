import { useEffect, useMemo, useRef } from 'react'
import { marked } from 'marked'
import gettingStarted from '../../../docs/getting-started.md?raw'
import theming from '../../../docs/theming.md?raw'
import motion from '../../../docs/motion.md?raw'
import { navigate, SiteLink } from '../router'

const documents = {
  'getting-started': { title: 'Getting started', markdown: gettingStarted },
  theming: { title: 'Provider and theming', markdown: theming },
  motion: { title: 'Motion', markdown: motion },
} as const

export default function DocsPage({ slug }: { slug: string }) {
  const key = slug in documents ? slug as keyof typeof documents : 'getting-started'
  const document = documents[key]
  const html = useMemo(() => {
    const markdown = document.markdown
      .replace(/\]\(getting-started\.md\)/g, '](/docs/getting-started)')
      .replace(/\]\(theming\.md\)/g, '](/docs/theming)')
      .replace(/\]\(motion\.md\)/g, '](/docs/motion)')
      .replace(/\]\(components\.md\)/g, '](/components)')
    return marked.parse(markdown, { async: false })
  }, [document])
  const article = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = article.current
    if (!root) return
    for (const heading of root.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
      if (!heading.id) heading.id = heading.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? ''
    }
    for (const pre of root.querySelectorAll('pre')) {
      if (pre.querySelector('button')) continue
      const button = window.document.createElement('button')
      button.className = 'site-doc-copy'
      button.textContent = 'Copy'
      button.onclick = async () => {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? '')
        button.textContent = 'Copied'
        window.setTimeout(() => { button.textContent = 'Copy' }, 1200)
      }
      pre.append(button)
    }
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="/"]')
      if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      navigate(anchor.pathname)
    }
    root.addEventListener('click', click)
    return () => root.removeEventListener('click', click)
  }, [html])

  return (
    <div className="site-workbench">
      <aside className="site-rail site-doc-rail" aria-label="Documentation">
        <span className="site-rail__eyebrow">GUIDES</span>
        {Object.entries(documents).map(([id, item]) => (
          <SiteLink key={id} className={id === key ? 'active' : ''} href={`/docs/${id}`}>{item.title}</SiteLink>
        ))}
        <span className="site-rail__eyebrow">EXPLORE</span>
        <SiteLink href="/components">Components</SiteLink>
        <SiteLink href="/playground">Playground</SiteLink>
      </aside>
      <main className="site-doc-main">
        <article ref={article} className="site-doc-article" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  )
}
