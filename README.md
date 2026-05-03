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
- **Select all**: operates on currently loaded items only — items not yet paginated are unaffected. Indeterminate when partially selected.
- **Pagination**: optional infinite scroll via `onLoadMore` + `hasMore`.
- **States**: loading, empty, no-results, error are all handled.
- **A11y**: trigger has `aria-haspopup` + `aria-expanded`, items are clickable labels, search has `aria-label`.

### Pagination (typePolicies)

Cursor-based merging is configured once in `apolloCache.ts` so `fetchMore` "just works". `keyArgs` deliberately excludes `first`/`after` (so successive pages merge into one cache entry) but includes `searchTerm` / `productIds` / `userIds` (so different filter combinations get separate entries).

`usePaginatedSearch` then becomes a thin wrapper: it owns search debouncing (300ms) and exposes `items`, `loading`, `loadingMore`, `hasMore`, `loadMore`. `NetworkStatus` discriminates initial-load / variables-changed / fetchMore.

## Decisions and assumptions

- **Cache-driven pagination** (`typePolicies`) over a manual `useState` accumulator. Simpler, idempotent, and the canonical Apollo pattern.
- **Draft / commit** semantics for MultiSelect — Cancel and click-outside both revert. This matches the Figma cancel-button behaviour and avoids surprising the user when they dismiss the dropdown by accident.
- **Always pass `first`** in queries: the mock server has a 10s delay if `first` and `last` are both omitted. Page size is 20.
- **Server-side search** for the filters: each MultiSelect debounces 300ms and queries the server, rather than client-filtering a single `first: 100` page. This scales to the full dataset and matches what a real backend search would do.
- **Select-all scope**: only affects currently loaded items. Documented in code. The alternative (selecting all 300 products without loading them) would require a separate "select all matching" semantic that wasn't in the spec.
- **Product images**: the GraphQL server returns `faker.image.avatar()` (people headshots), which doesn't fit a "product card". The card swaps in `https://picsum.photos/seed/${id}/...` for deterministic, varied imagery without modifying the server.
- **Styling**: Tailwind utility classes only, no UI library. The brand teal (`teal-500/600`) is used for the Apply button, checked checkboxes, and the Clear/Load-more accents.
- **Responsive**: filters stack on mobile, side-by-side on `sm`+; grid steps from 1 → 2 → 3 → 4 columns; the dropdown stays anchored (no full-screen modal — the dataset and item rows fit comfortably on phones).

## Time spent

Roughly 4–5 hours, mostly on the Apollo 4 + typePolicies pagination wiring and getting the staircase code style right. See AI-SUPPORT.md.
