# AI Support

Built with Claude Code (Opus 4.7 for planning/review, Sonnet 4.6 for code generation).

## My contribution

- Architecture: generic MultiSelect with draft/commit, Apollo `typePolicies` for cursor merging, URL-driven filter state, `*` sentinel for select-all
- Defined the project's code style and reviewed every file against it
- UX call: Loremflickr (Picsum onError fallback) for product images since faker returns people headshots

## Claude's contribution

- Initial code generation across all source files
- Apollo 4 refactor (`onCompleted` was removed in v4 — switched to `typePolicies` + `NetworkStatus`)
- URL filter state via `useSearchParams`/`useRouter` (browser back/forward works)
- `*` sentinel implementation across MultiSelect props + URL serialization
- **Tests**: Vitest + React Testing Library + jsdom. 25 MultiSelect unit tests (trigger states, draft/commit, click-outside/Escape, search, select-all + individual, indeterminate, empty/loading/no-results, infinite scroll). 6 PurchasesPage integration tests with Apollo `MockedProvider` and mocked `next/navigation` (URL parsing, `*` round-trip, apply/clear).

## With more time

- Extract MultiSelect into a shared component library with stories
- Replace inline SVGs with `lucide-react` (or similar)
- Virtualise the dropdown list once item counts exceed a few hundred
- Wire `npm run test` into a GitHub Actions CI workflow
