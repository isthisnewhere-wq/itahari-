# Local and semantic SEO implementation

## Five core pages

| URL | Centerpiece | Reader intent | Next step |
|---|---|---|---|
| / | Bahattar Cafe in Itahari | Understand the venue | Menu or directions |
| /coffee/ | Coffee and espresso at Bahattar Cafe | Compare coffee and prices | Espresso / iced categories, then visit |
| /food/ | Bahattar food menu | Compare meals and snacks | Food categories, then call / visit |
| /breakfast/ | Breakfast and refreshments | Choose breakfast or a non-coffee drink | Breakfast / alternatives categories |
| /menu/ | Complete cafe menu and prices | Find an exact item and price | Search / filter, then contact |

The complete menu is the canonical full reference. Other core pages focus on their relevant categories, with distinct copy, headings, photographs, title tags, and meta descriptions. Core pages are linked in the footer and related-navigation component. Journal entries link to a relevant menu category and core page with contextually appropriate anchors.

The supplied local business information is used consistently. The home page includes CafeOrCoffeeShop JSON-LD with no invented coordinates, reviews, ratings, delivery, or reservation data. The complete menu includes Menu / MenuSection / MenuItem / Offer data in NPR. All pages include breadcrumbs and social metadata. Static HTML exposes content without JavaScript. Images have supplied subjects and descriptive alt text. Menu search is progressive enhancement; all items are present in HTML.

Opening hours are explicitly marked as supplied and awaiting owner confirmation. The schema uses only those visible supplied hours. Confirm them before public indexing. No unverified legal or promotional claims are included about hookah.

## Publishing state

No final domain is supplied. Local builds use localhost canonical, sitemap, Open Graph and schema URLs, with noindex,nofollow and robots Disallow. A confirmed SITE_URL rebuild switches metadata and robots for production. The 404 page is excluded from sitemap and the local server returns HTTP 404 for missing resources.

## Content strategy

Eight useful articles are published locally. The 37 supplied content ideas are mapped in topical-map.md / .csv; overlapping ideas are consolidated or retained as future editorial work rather than published as thin pages. Planned URLs are not website links or sitemap entries. No keyword volume, difficulty, ranking, or traffic numbers are claimed. Keyword themes are editorial hypotheses from the supplied brief; no account-based SEO research was required.

## Further work

Verify final hosting headers, redirects, custom domain, mobile experience, live sitemap and indexing directives after owner approval. Measure live Core Web Vitals once real field traffic exists; local implementation does not establish field scores.
