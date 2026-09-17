# Security

## Reporting a vulnerability

Report privately through GitHub's
[security advisories](https://github.com/adit-firdaus/may-ui/security/advisories/new),
not a public issue. If that is unavailable, email
<aditfirdaus.dml@gmail.com> with "may-ui security" in the subject.

Please include the version, a minimal reproduction, and what an attacker gains.
Expect an acknowledgement within a week.

## Supported versions

Only the latest minor is patched. The package is pre-1.0, so fixes land in a new
minor rather than being backported.

## What is in scope

May UI is a client-side component library with no network calls, no storage, and
no server. The realistic surface is narrow, and these are the parts worth
looking at:

- **Rendered content.** Components render what they are given. React escapes it,
  and nothing in the package uses `dangerouslySetInnerHTML`. A prop that reaches
  the DOM unescaped would be a bug worth reporting.
- **`asChild` and `trigger`.** Both clone a caller-supplied element and inject
  props onto it. They are as trusted as the element you pass; passing one built
  from untrusted input is your own injection.
- **`components={{ … }}` defaults.** These are ordinary props, merged ahead of
  the ones at the call site, so they carry React's own protections: attribute
  values are escaped, a `javascript:` URL is blocked, and a string where a
  handler belongs is rejected. Checked, and nothing here is special to May. The
  exception is a `style` value, which React does not sanitise — the same is
  true of `style` written directly on any element, so treat a default built
  from untrusted input exactly as you would that.
- **Theme token values.** `theme={{ tokens }}` lands as inline custom
  properties on the root, so a value never enters stylesheet text. It is still
  a declaration list, so a value containing `;`, `{` or `}` would split it and
  set arbitrary CSS on that element — measured before the guard, one token
  value parsed as eleven declarations, painting a background and overriding
  `--may-label` for the whole subtree. Such values are now dropped with a
  development warning. No script can run this way, but if you feed a theme
  from a CMS, a URL or a saved preference, a value that reaches the element
  intact is worth reporting.
- **Content Security Policy.** Component CSS ships as React style resources
  rather than a stylesheet asset. Under a strict CSP, pass `styleNonce` to
  `MayProvider` **and** React's nonce render option in its object form —
  `{ nonce: { style: nonce } }`. The string form of that option applies to
  scripts alone, and with it no style tag is nonced at all. With both, every
  emitted `<style>` carries it; a route where it does not is a bug.
- **Supply chain.** Two runtime dependencies, `motion` and `react-icons`, both
  declared and both externalised. `npm publish` runs with `--provenance`, so
  releases are attestable to the workflow that built them.

## What is not

Anything requiring the attacker to already control the consuming application's
source, and anything in the example site or Storybook, which are development
artifacts and not published to npm.
