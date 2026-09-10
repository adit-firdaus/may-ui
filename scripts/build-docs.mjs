/**
 * Renders the Markdown in docs/ to a small static site in docs-site/.
 *
 * Deliberately not a docs framework: one pass of `marked` per file into a
 * self-contained HTML template. The GitHub Pages workflow copies the output to
 * /docs on the site, beside the gallery and Storybook.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { marked } from 'marked'

const here = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(here, '../docs')
const outDir = resolve(here, '../docs-site')
const repo = 'https://github.com/adit-firdaus/may-ui/blob/master'

/** The guides, in reading order — also the sidebar. */
const pages = [
  { md: 'README.md', out: 'index.html', title: 'Overview' },
  { md: 'getting-started.md', out: 'getting-started.html', title: 'Getting started' },
  { md: 'theming.md', out: 'theming.html', title: 'Theming' },
  { md: 'motion.md', out: 'motion.html', title: 'Motion' },
  { md: 'components.md', out: 'components.html', title: 'Components' },
]

const nav = (current) =>
  pages
    .map(
      (p) =>
        `<a href="${p.out}"${p.out === current ? ' aria-current="page"' : ''}>${p.title}</a>`,
    )
    .join('') +
  `<a href="https://adit-firdaus.github.io/may-ui/">Gallery ↗</a>` +
  `<a href="https://adit-firdaus.github.io/may-ui/storybook/">Storybook ↗</a>`

/** Sibling `foo.md` → `foo.html`; `../Foo.md` → the file on GitHub. */
const rewriteLinks = (html) =>
  html
    .replace(/href="\.\.\/([^"]+\.md)"/g, `href="${repo}/$1"`)
    .replace(/href="(?!https?:|\.\.\/)([^":/]+)\.md"/g, 'href="$1.html"')

const template = (title, current, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · May UI</title>
<style>
  :root { color-scheme: light dark; --bg:#fff; --fg:#1d1d1f; --muted:#6e6e73; --line:#e5e5ea; --tint:#0071e3; --code:#f5f5f7; }
  @media (prefers-color-scheme: dark) { :root { --bg:#000; --fg:#f5f5f7; --muted:#98989d; --line:#2c2c2e; --tint:#0a84ff; --code:#1c1c1e; } }
  * { box-sizing: border-box; }
  body { margin:0; font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--fg); background:var(--bg); }
  .shell { display:grid; grid-template-columns:240px minmax(0,1fr); max-width:1100px; margin:0 auto; }
  nav { position:sticky; top:0; align-self:start; height:100vh; overflow:auto; padding:2rem 1rem; border-right:1px solid var(--line); }
  nav .brand { font-weight:600; font-size:1.1rem; margin-bottom:1.25rem; }
  nav a { display:block; padding:.4rem .6rem; border-radius:8px; color:var(--fg); text-decoration:none; font-size:.95rem; }
  nav a:hover { background:var(--code); }
  nav a[aria-current="page"] { background:var(--tint); color:#fff; }
  main { padding:2.5rem 3rem; min-width:0; }
  main :first-child { margin-top:0; }
  h1,h2,h3 { line-height:1.25; letter-spacing:-.01em; }
  h2 { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); }
  a { color:var(--tint); }
  code { background:var(--code); padding:.15em .4em; border-radius:6px; font-size:.9em; }
  pre { background:var(--code); padding:1rem 1.25rem; border-radius:12px; overflow:auto; }
  pre code { background:none; padding:0; }
  table { border-collapse:collapse; width:100%; margin:1rem 0; font-size:.95rem; }
  th,td { text-align:left; padding:.5rem .75rem; border-bottom:1px solid var(--line); }
  blockquote { margin:0; padding:.5rem 1rem; border-left:3px solid var(--tint); color:var(--muted); }
  @media (max-width:720px) { .shell { grid-template-columns:1fr; } nav { position:static; height:auto; border-right:0; border-bottom:1px solid var(--line); } main { padding:1.5rem 1.25rem; } }
</style>
</head>
<body>
<div class="shell">
  <nav><div class="brand">May UI</div>${nav(current)}</nav>
  <main>${body}</main>
</div>
</body>
</html>
`

mkdirSync(outDir, { recursive: true })
const known = new Set(readdirSync(docsDir))
for (const page of pages) {
  if (!known.has(page.md)) continue
  const md = readFileSync(resolve(docsDir, page.md), 'utf8')
  const body = rewriteLinks(marked.parse(md, { async: false }))
  writeFileSync(resolve(outDir, page.out), template(page.title, page.out, body))
}
console.log(`wrote ${pages.length} pages to docs-site/`)
