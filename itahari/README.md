# Bahattar Cafe · Itahari

A complete static café website with 23 pages, all six supplied photographs, a searchable 66-item menu, category filters, an accessible photo gallery, and direct call / Google Maps actions.

## Run locally

Requires Node.js 20 or later. No package installation is needed.

```powershell
node scripts/build.mjs
node scripts/serve.mjs
```

Open http://127.0.0.1:4173 (or http://localhost:4173).

```powershell
node scripts/check.mjs
```

## Edit

- Menu and supplied hours: `src/menu.mjs`
- Page content, metadata, and layout: `scripts/build.mjs`
- Journal articles: `src/articles.mjs`
- Design: `src/styles.css`
- Menu, navigation, map, gallery interactions: `src/client.js`
- Original supplied images: `public/assets/`
- Generated static website: `dist/`
- Page inventory and owner checklist: `docs/`

Rebuild after editing source. The server serves the latest generated files.

## Before launch

The site has not been published. Complete `docs/owner-verification.md`, confirm the domain, then rebuild with the actual origin to generate production canonical URLs, social URLs, sitemap, structured data, and indexable robots metadata:

```powershell
$env:SITE_URL = 'https://OWNER-CONFIRMED-DOMAIN'
node scripts/build.mjs
node scripts/check.mjs
```

Without `SITE_URL`, the build deliberately uses localhost metadata and `noindex,nofollow` / `Disallow: /`. Do not upload a local-preview build to production. Publication still needs the owner’s explicit permission.

The website has no ordering, booking, payment, analytics, or contact-form backend. Telephone links and Maps links work through the visitor’s device or provider. The embedded Google search map loads only after the visitor requests it; confirm the exact listing pin with the owner.

Design reference cloned as requested into `.design-tools/ui-ux-pro-max-skill`. The local reference is excluded by `.gitignore` and is never served by the website.
