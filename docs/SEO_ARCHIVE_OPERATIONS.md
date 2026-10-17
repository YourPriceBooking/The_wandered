# SEO archive: implementation and acceptance

Stage 4 follows merged PRs #276–#278. It changes archive navigation and sitemap
membership, without changing article bodies or the four travel widgets.

## Blog sitemap

`/sitemap.xml` includes 15 indexable static routes and the complete verified article
inventory. The checked-in seed has 142 articles, matched against all eight API
totals on 17 October 2026 (157 total URLs). Journal entries link to
`yourpricebooking.com`; those URLs belong to that site's sitemap and are excluded
from The Wandered's sitemap. The journal's own two landing routes remain included.
The internal search route stays noindex and is excluded.

The collector explicitly paginates `get-all` with page/limit=100 for every country,
including home. It verifies totals, IDs, pagination drift and each record through
`getPostData`, exactly as the article route does. Confirmed missing records are
excluded; unknown conflicts, malformed results, 5xx and timeouts abort the refresh.
It normalizes the canonical route and verifies the looked-up ID and URL match.
This validates the route's article existence contract, not a separate production
HTTP crawl of every URL. Production redirects/noindex still require acceptance.

The seed can be regenerated atomically with:

```bash
npm run seo:refresh-sitemap
```

Inspect the totals/exclusions and commit the resulting
`src/defaultData/sitemapSnapshot.json` when intentionally updating the release
fallback. A failed collector never overwrites it. Runtime refreshes do not edit
tracked source files.

## Journal pagination

The legacy API independently slices four language collections and has no total.
`page=1&limit=10` returns up to 40 records; an out-of-range source page can return
an entire collection. It cannot safely drive the old infinite scroll.

The server requests the combined source once at `page=1&limit=100000`, validates
records/unique IDs and rejects a saturated response. The live response contained
23,532 records. Both journal pages are English, so visible records are selected
by the API's explicit English URL suffix/path: 5,892 records, 590 pages. Records
use stable descending ObjectId creation order; no modification dates are invented.
A formal total/cursor endpoint would remove this legacy API dependency and reduce
the cold-start payload; this remains a backend/performance improvement.

`new-episodes` serves ten records per page, including in initial HTML. First,
Previous and Next are normal anchors. Browser navigation owns history and scroll
restoration; scrolling no longer rewrites the query or fetches unrelated batches.
Reload displays the same slice. The last page omits Next. Out-of-range pages
return 404/noindex. Page 1, malformed/duplicate page values and ignored query
parameters redirect to the normalized URL with 308. Next handles trailing slash
normalization. The main journal landing shows three latest English records;
its legacy page>1 URLs redirect to `new-episodes?page=N`.

Game Zone links use `#game-zone`. Legacy `?page=game-zone` redirects to that
fragment, and the game iframe no longer rewrites browser history when observed.

## Runtime snapshots

Default storage: `.cache/the-wandered-seo`, outside `.next`. It is gitignored and
survives rebuilding in the same checkout. If deployment replaces the checkout,
set `SEO_CACHE_DIRECTORY` to a persistent directory writable by the Node user.
Both journal and sitemap snapshots use gzip JSON, atomic rename, validation on
read, a one-hour TTL, shared in-flight refresh and one-minute failure backoff.
Failures retain the last complete snapshot. The journal returns a server error
when no snapshot/API response exists; it does not pretend the archive is empty.
The sitemap also has a release seed; without any complete source it returns 503
with Retry-After, never a misleading static-only 200.

Response headers expose `X-Sitemap-URLs`, `X-Sitemap-Generated-At`,
`X-Sitemap-Status` (fresh-complete / stale-complete), plus ETag. Stale snapshots
are explicitly identified; monitor their age rather than assuming a 200 means
fresh data. Per-country totals/included/excluded counts are logged on refresh.
XML is partitioned automatically at 50,000 URLs or a conservative 48 MiB;
`/sitemap.xml` then becomes an index of `/sitemaps/N.xml`. There is no need to
change robots.txt or the submitted sitemap URL when the archive grows.

## Verification and remaining acceptance

Automated unit/production HTTP tests cover archive traversal, totals/duplicates,
upstream failures, durable restart/fallback, PNG/metadata regression, XML limits,
ETag/503, all eight article lists, journal slices/reload/404/308 and crawlable links.
Run the CI commands in `.github/workflows/ci.yml`.

After deployment:

- Check first, second and last journal pages on desktop/mobile, including Back,
  Forward and scroll restoration. Interactive Chromium could not run in this
  environment; these interactions are not reported as tested.
- Check Game Zone navigation from header/footer and an old bookmarked query URL.
- Check sitemap headers, parsed count, known articles and index/shard behavior if
  the archive grows. A drop from the previous 23k+ URLs is expected: external
  booking URLs are removed; 142 real blog articles remain in the verified seed.
- Crawl production responses for redirects, 404/5xx and noindex/canonical conflicts;
  resubmit the sitemap and inspect Google-selected canonical in Search Console.
- Confirm cache persistence through the actual PM2 deployment/restart and monitor
  snapshot age/API failures. Field performance remains stage 7.
