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
- **Content Security Policy.** Component CSS ships as React style resources
  rather than a stylesheet asset. Under a strict CSP, pass `styleNonce` to
  `MayProvider` and it reaches every emitted `<style>`; a route where it does not
  is a bug.
- **Supply chain.** Two runtime dependencies, `motion` and `react-icons`, both
  declared and both externalised. `npm publish` runs with `--provenance`, so
  releases are attestable to the workflow that built them.

## What is not

Anything requiring the attacker to already control the consuming application's
source, and anything in the example site or Storybook, which are development
artifacts and not published to npm.
