# Verification

## Build and static checks

- `node scripts/build.mjs` builds 23 pages with no external runtime dependencies.
- `node scripts/check.mjs` verifies one unique H1, title, and description per page; canonical and social metadata; valid JSON-LD; unique IDs; all internal routes and section anchors; image dimensions and alt attributes; click-to-call links; and no orphan content pages.
- All 66 item names and prices were compared against a separate reference extracted directly from the original supplied brief, not derived from implementation menu data. Reference retained in `supplied-menu-reference.json`.
- Passed: 740 internal links, 61 section anchors, 25 JSON-LD blocks, sitemap coverage, and robots declaration.
- All 37 supplied content ideas are accounted for in the topical maps. Eight substantial guides are implemented; the rest are consolidated or listed as unpublished backlog.

## Browser checks

- All five core pages and visitor-information templates tested at 375px, 768px, and 1280px widths: 45 page/viewport checks, no horizontal overflow, missing loaded images, or duplicate H1 elements.
- Menu category filtering and search verified together: espresso + “latte” gives three results; unmatched search gives zero with a working reset to all 66 items.
- Initial and same-document category deep links verified; fixed hash-change handling so footer/category links select the proper category even when already on the menu page.
- Mobile navigation opens, exposes page links, and navigates to the selected page.
- Photo gallery opens with its caption and closes with Escape.
- FAQ questions expand to show their answers.
- Telephone URI and the supplied Maps URL verified without placing a call.
- Optional Google Maps iframe is absent before interaction and receives the intended café-search URL after “Load Google Map”. The exact business pin remains for owner confirmation.
- No browser console errors or warnings observed during the tested flows.

## Limits and owner review

Physical facilities, food availability, taxes, allergens, and exact map pin require owner confirmation. No final hosting environment or domain has been provided, so real-world field Core Web Vitals, production redirects, and public indexing remain outside local verification. The privacy, terms, and accessibility pages require owner review for the final service configuration.

The local website intentionally remains unindexed. No online ordering or booking is presented as operational. No publication was performed.
