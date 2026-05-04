# Eversports Frontend Assignment

A reusable multi-select component (Task 1) integrated into a purchases page that filters by products and users (Task 2).

## Run

```sh
npm install
npm run dev:server   # GraphQL mock server on http://localhost:4000
npm run dev:client   # Next.js client on http://localhost:3000
```

Open `http://localhost:3000` after both are running.

## Tech Stack

- Next.js 15 (App Router) · React 19 · TypeScript 5 (strict)
- Tailwind CSS 3
- Apollo Client 4 — paginated queries via `InMemoryCache` `typePolicies`

## Architecture

```
src/
  app/
    page.tsx                       # mounts PurchasesPage
    layout.tsx                     # Apollo provider
    app.types.ts                   # User, Product, Purchase, Connection<T>
    components/
      MultiSelect.tsx              # generic, reusable multi-select
      PurchasesPage.tsx            # main page (two filters + grid)
      PurchaseCard.tsx             # single purchase tile
  lib/
    apolloCache.ts                 # cache factory with cursor-merge typePolicies
    ApolloClient.ts                # SSR client
    ApolloWrapper.tsx              # client provider
    queries.ts                     # PRODUCTS_QUERY, USERS_QUERY, PURCHASES_QUERY
    usePaginatedSearch.ts          # debounced search + cursor pagination hook
```

### MultiSelect (Task 1)

Generic over the item shape — domain-agnostic via `getId` and `getLabel` props. Used by both the product and user filters and is structured to be easily reused for any other domain (sport classes, etc.).

Behaviour:

- **Draft state**: opening the dropdown copies committed selections into an internal draft. Apply commits; Cancel / click-outside / Escape revert.
- **Search**: controlled by parent so debouncing happens at the data-fetching layer.
- **Select all**: means "all items in the dataset" (not just currently loaded). When active, newly paginated items also render as checked. Indeterminate state when individually selected items don't cover all loaded items.
- **Pagination**: optional infinite scroll via `onLoadMore` + `hasMore`.
- **States**: loading, empty, no-results, error are all handled.
- **A11y**: trigger has `aria-haspopup` + `aria-expanded`, items are clickable labels, search has `aria-label`.

### Pagination (typePolicies)

Cursor-based merging is configured once in `apolloCache.ts` so `fetchMore` "just works". `keyArgs` deliberately excludes `first`/`after` (so successive pages merge into one cache entry) but includes `searchTerm` / `productIds` / `userIds` (so different filter combinations get separate entries).

`usePaginatedSearch` then becomes a thin wrapper: it owns search debouncing (300ms) and exposes `items`, `loading`, `loadingMore`, `hasMore`, `loadMore`. `NetworkStatus` discriminates initial-load / variables-changed / fetchMore.

## Decisions and assumptions

- **Cache-driven pagination** (`typePolicies`) over a manual `useState` accumulator. Simpler, idempotent, and the canonical Apollo pattern.
- **Filter state in URL**: filter selections live in `?productIds=...&userIds=...` via `useSearchParams` + `useRouter`. Reload preserves selections, browser back/forward navigates between filter states. Shareable URLs.
- **Draft / commit** semantics for MultiSelect — Cancel and click-outside both revert. This matches the Figma cancel-button behaviour and avoids surprising the user when they dismiss the dropdown by accident.
- **Always pass `first`** in queries: the mock server has a 10s delay if `first` and `last` are both omitted. Page size is 20.
- **Server-side search** for the filters: each MultiSelect debounces 300ms and queries the server, rather than client-filtering a single `first: 100` page. This scales to the full dataset and matches what a real backend search would do.
- **Select-all = "all in dataset"**: rather than materializing every ID into the URL, select-all sets a `*` sentinel (`?productIds=*`). The server query then omits the `productIds` filter (returns all matching purchases). Keeps URLs short and survives a future dataset growing.
- **Product images**: the GraphQL server returns `faker.image.avatar()` (people headshots) which doesn't fit product cards. The card uses **Loremflickr** (`https://loremflickr.com/400/300/{productName}?lock={seed}`) as primary — Flickr-tag search by product name gives images that loosely match — with **Picsum** as `onError` fallback for guaranteed render.
- **Styling**: Tailwind utility classes only, no UI library. The brand teal (`teal-500/600`) is used for the Apply button, checked checkboxes, and the Clear/Load-more accents.
- **Responsive**: filters stack on mobile, side-by-side on `sm`+; grid steps from 1 → 2 → 3 → 4 columns; the dropdown stays anchored (no full-screen modal — the dataset and item rows fit comfortably on phones).

## Tests

```sh
npm run test           # one-shot run (Vitest)
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

- **Unit tests** for `MultiSelect` (25 cases): trigger label states, draft/commit, click-outside / Escape / Cancel revert, search interactions, individual + select-all toggles, indeterminate state, empty/loading/no-results/error, infinite scroll.
- **Integration tests** for `PurchasesPage` (6 cases) using Apollo's `MockedProvider` and a mocked `next/navigation`: URL parsing into committed state, `*` sentinel round-trip, apply pushes URL, clear removes params, query receives correct variables.
- Coverage scoped to `MultiSelect.tsx` (94.8% statements, 97% lines) and `PurchasesPage.tsx` (83.3% statements, 84.7% lines).

## Time spent

Under 4 hours of focused work, despite spreading across two days. Most of the time was on the Apollo 4 + typePolicies pagination wiring, the URL filter state + `*` sentinel design, the test suite, and a pre-submission code review pass. See AI-SUPPORT.md.
