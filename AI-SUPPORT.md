# AI Support

This assignment was completed with substantial use of Claude Code (Anthropic's coding CLI), running Opus 4.7 as the primary planning/review model and delegating code generation to Sonnet 4.6 subagents. Below is a transparent breakdown.

## What I (the candidate) did

- Read the assignment brief and the Figma design.
- Made the architectural decisions: how to split the MultiSelect (generic, draft/commit, controlled search), how to handle pagination (Apollo `typePolicies` over manual `useState`), the file layout, and the UX edge cases (select-all scope, click-outside reverts, empty/loading/no-results states).
- Defined the project's code style (formatting, staircase ordering, section separators, naming) and reviewed every file against it.
- Made the call to swap product images for Picsum because faker's avatars are people headshots.

## What Claude did

- **Planning prompts**: I described the tasks and Claude (Opus) drafted the component API, the hook signature, and the cache-merge approach.
- **Code generation**: Claude (Sonnet) wrote the initial implementation of `MultiSelect.tsx`, `usePaginatedSearch.ts`, `apolloCache.ts`, `queries.ts`, the `PurchasesPage`, and the card.
- **Refactor for Apollo 4**: the first pass used `onCompleted` (removed in Apollo 4) — Claude flagged the TS errors, then refactored to use `typePolicies` for cursor merging plus `NetworkStatus` for loading discrimination.
- **Code style enforcement**: I reviewed each file against the style guide; Claude applied the staircase reordering and structural fixes.

## What I would change if I had more time

- Add a small unit test for `MultiSelect` (draft/commit, select-all indeterminate, click-outside revert, empty states).
- Extract `MultiSelect` into a `src/components/` folder once a real design system exists, with stories.
- Replace the inline SVG icons with a tiny icon component (or `lucide-react`) to keep the JSX cleaner.
- Add a "selected count" pill inside the trigger and the list (sticky-pinned-selected pattern) for very large datasets.
- Virtualise the dropdown list (`react-virtual`) once item counts realistically exceed a few hundred per page.
