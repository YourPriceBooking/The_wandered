import 'server-only';
import { createArticleListService } from './articleListService';

// no-store applies to the underlying transport; only validated, reduced card data is
// retained for 30 seconds. Existing article detail lookups remain fresh/no-store.
export const getListingPosts = createArticleListService({ fetcher: (url, options) => fetch(url, options) });
