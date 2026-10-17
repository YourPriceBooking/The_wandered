# Semantics and structured data: stage 5

Based on main dd95637 after merged PR #279. Route count remains 24: this change
uses the existing article, listing and author pages rather than adding new URLs.

## Implemented

- Exactly one primary H1 on article/listing pages, including Uncharted Planet.
  Card titles use linked H2; brand labels and hover copies are ordinary text.
  Journal archive cards use H2; the journal landing's cards use H3 under its H2.
  Editor H1 elements become section H2 elements, preserving their text/attributes.
- Native image/title/read-more anchors share the same canonical URL helper as
  metadata and sitemap. Unsupported external article URLs do not become links.
  Card image navigation no longer depends on router handlers or a second tap.
- Server recommendations provide up to four same-section links in initial HTML.
  They exclude the current ID and remain available without Redux or JS. The
  recent seven-record section batch is the candidate set, not an exhaustive or
  relevance-ranked recommendation search. Optional list failures omit this block;
  they do not change a readable article into a 500. The optional request uses a
  three-second timeout. Remove the now-unused global client post-list fetch.
  Cache/performance remains stage 7.
- Article breadcrumbs are visible, localized, sequential links. BreadcrumbList
  uses the same items and ends at the page canonical. Both website and article
  schemas are emitted server-side as escaped JSON-LD.
- BlogPosting contains the actual headline/description, real image when present,
  known Person identity, publisher, canonical mainEntityOfPage, section/language
  and supplied valid ISO dates. Generic social fallbacks are not article photos;
  absent/invalid dates and unknown profile URLs are omitted. No ratings, reviews,
  registration numbers, addresses, fact-check claims or invented X handles.
- Publication/modified times are visible and share date parsing with metadata
  and JSON-LD. Known author bylines link to the existing localized author anchor.
  Person IDs agree with the author directory across languages. Unknown authors
  retain their visible name and Person name without a guessed profile or ID.
- Homepage WebSite and publisher Organization share stable IDs with articles.
  Publisher identity comes from the existing Privacy Policy, footer and public
  author profiles: Your Price Booking OÜ; company URL is its existing public site.
- Captions use figure/figcaption where an image stands alone; inline captions
  remain text. Main article content excludes recommendations and promotions.
  The two product banners have an explicit localized publisher-promotion label;
  no third-party payment/affiliate relationship is asserted or manufactured.
- Existing author pages now explain the publisher, displayed dates, source links
  and the existing Help center contact. This states visible functionality, not a
  fabricated editorial review policy. Header layout and travel widgets are unchanged.

## Verification

Production build, full standalone TypeScript, existing indexing/archive/social
regressions, targeted schema units and production HTTP tests. Checks parse the
actual initial HTML without executing JS and compare JSON-LD to H1, byline,
profile anchor, dates, breadcrumb text/URLs and publisher identities. JSON-LD
closing-script and Unicode separator payloads cannot create an extra script.
Image captions retain text and the document has no editor-supplied extra H1.
Real farm-article API data also produced HTTP 200, one H1, BlogPosting,
BreadcrumbList and four canonical related-article URLs in local production. A separate live homepage check returned 500
from the existing article-list service; fixture-backed homepage HTTP tests pass.
Live homepage/list availability is not reported as verified.

These are local semantic/contract checks. They are not a claim that Google Rich
Results Test or Schema Markup Validator has approved a deployed URL.

## Acceptance after deployment

1. Use Google Rich Results Test on one article in each template family and on
   en/uk/pl examples; check Article/Breadcrumb items and recommended properties.
2. Check the same URLs with Schema Markup Validator. Validate homepage WebSite/
   Organization and author CollectionPage/Person identities.
3. Use Search Console URL Inspection to compare rendered headline, author, dates,
   canonical and crawl status. Structured data does not guarantee rich results.
4. Check first-tap image/title navigation, keyboard focus, author tooltips,
   breadcrumbs and related-card layout on desktop/mobile. Interactive Chromium
   could not start in this environment; these interactions remain unverified.
5. Confirm the actual editorial source/review/correction process with the publisher
   before publishing stronger policy claims. The existing Privacy Policy also says
   there are no cookies/third-party providers while layout includes Google Analytics;
   reconcile that content with the actual setup separately rather than guessing a policy.

Next planned code PR: stage 6, preserve the four Travel Resources widgets and fix
missing destination wrappers, iframe titles/loading/sizes and source links.
