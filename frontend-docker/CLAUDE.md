# CLAUDE.md

Coding rules for this frontend project. Follow these when writing or reviewing code here.

## Stack

- React 19 + TypeScript, Vite 8 (rolldown-vite, with `@vitejs/plugin-react` + the React
  Compiler babel preset already wired in `vite.config.ts` — don't remove it, don't add
  `useMemo`/`useCallback` manually just to satisfy the compiler).
- Tailwind CSS v4, config lives entirely in `src/index.css` via `@theme` (no
  `tailwind.config.*` file — that's expected in v4, do not create one).
- react-router-dom v7 (`BrowserRouter` + `<Routes>`, declarative — not the data router API).
- Vitest + React Testing Library + jsdom for tests.
- Dependency versions in `package.json` are pinned exact (no `^`/`~`). When adding a
  package, install the latest version, then strip the caret in `package.json`.

## Commands

```
npm run dev         # start Vite dev server
npm run build        # tsc -b && vite build
npm run test         # vitest run (CI mode, single run)
npm run test:watch   # vitest watch mode
npm run test:ui      # vitest with the browser UI
npm run lint         # oxlint
```

Run `npm run test` and `npx tsc -b` before considering any change done.

## Project structure

```
src/
  app entry: main.tsx, App.tsx (providers + routes), index.css (Tailwind + design tokens)
  types/        shared domain types (Snippet, UserProfile, ...)
  data/         hardcoded seed/mock data
  lib/          pure, framework-free functions (prompt variables, dockerfile lint,
                tokenizer, tag normalization, clipboard). These have no React import and
                are the easiest place to add unit tests.
  context/      React Context providers: ThemeContext, AuthContext, SnippetsContext
  components/
    ui/         generic, app-wide primitives (Button, Badge, FormField, ThemeToggleButton)
    layout/     Header, Footer, AppLayout
  features/     one folder per screen/domain area, each owning its page + local components
    auth/, home/, snippets/, prompt-lab/, create/, dashboard/, profile/
  test/         ALL tests live here (see Testing rules), plus test setup and
                renderWithProviders test helper
```

## Architecture rules

- **All state access goes through a Context, never through a data module directly.**
  Screens/components must not import from `src/data/*` directly — they call
  `useSnippets()` / `useAuth()` / `useTheme()`. This keeps every read/write of app data in
  one seam, so the data source can be swapped later without touching screen code.
- **A component goes in `components/ui/` only if it has zero domain knowledge** —
  reusable in a totally different app (Button, Badge, form fields, theme toggle).
  Anything that knows about snippets/prompts/tags lives under the relevant
  `features/*/components/` folder instead.
- **Business/formatting logic goes in `lib/`, not inline in components.** Anything you'd
  want to unit-test without mounting React (variable extraction/filling, linting,
  tokenizing, tag normalization) is a plain function in `src/lib/`, with a `.test.ts`
  file next to it. Components call these functions; they don't reimplement the logic.
- **URL-shareable UI state lives in the URL, not component state.** E.g. the tag filter
  on list screens lives in `?tag=` search params (`useTagFilter` hook) so a filtered
  link can be shared or reloaded. Apply the same pattern to future "which item is
  selected" style state.
- Don't reach for a state management library (Redux/Zustand/etc.) for this app's size;
  React Context is enough. Discuss before introducing one.
- **Browsing the app never requires logging in.** All routes under `AppLayout` are
  public; `/auth` is an optional entry point (login/register/guest), not a gate. Don't
  reintroduce a route guard that redirects unauthenticated visitors away from `/`.
  `AuthContext.isAuthenticated` only reflects whether the user went through `/auth`
  (used e.g. to skip showing the auth form again) — it must never block navigation.

## Styling rules

- All colors are semantic Tailwind tokens defined in `src/index.css` under `@theme`
  (`bg`, `panel`, `panel2`, `code`, `bd`/`bd2`/`bd3`, `tx`/`tx2`/`tx3`, `mut`/`mut2`/`mut3`,
  `acc`, `acc-ink`, `vio`, `err`, `warn`, ...). **Never hardcode a hex/rgb color in a
  component** — add a token to `index.css` instead, so both themes stay in sync.
- Dark/light mode toggles via `data-theme="dark"` on `<html>` (see `ThemeProvider`), using
  the `@custom-variant dark` declared in `index.css`. Both palettes are defined as CSS
  custom properties feeding the same Tailwind token names, so components should rarely
  need an explicit `dark:` variant — the token itself changes value per theme.
- Gradients/glow (`bg-grad`, `bg-grad-soft`, `bg-grad-vio-acc`, `shadow-glow`) are plain
  CSS classes in `index.css`, not Tailwind utilities — don't reintroduce them as
  arbitrary-value classes on components.
- Do not layer two utility classes that set the same CSS property on one element (e.g.
  a background-color utility plus a custom gradient class) — which one wins depends on
  stylesheet generation order, not on the order written in `className`. If a component
  needs a one-off variant of a shared UI primitive, write the markup directly instead of
  overriding that primitive's classes with conflicting utilities.
- Keep the app responsive; check both dark and light themes when changing visual code.

## Testing rules

- **All tests live under `src/test/`, never colocated next to the source file.** Mirror
  the path of the file under test: a test for `src/lib/tags.ts` goes at
  `src/test/lib/tags.test.ts`, a test for `src/features/auth/AuthPage.tsx` goes at
  `src/test/features/auth/AuthPage.test.tsx`, etc. Do not create `*.test.ts(x)` files
  anywhere outside `src/test/`.
- `src/test/setup.ts` is the Vitest setup file (registered in `vite.config.ts`) and
  `src/test/renderWithProviders.tsx` wraps a component in the same providers `App.tsx`
  uses (`ThemeProvider`, `AuthProvider`, `SnippetsProvider`) plus a `MemoryRouter` — use
  it for any component/page that reads context or route params. Pass
  `{ route: '/some/path' }` when the component reads route params.
- Pure logic in `src/lib/*.ts` gets plain Vitest unit tests, no rendering.
- Prefer Testing Library queries by role/label text over test ids or class names. When a
  query is ambiguous (e.g. two buttons with the same visible text), disambiguate with a
  structural attribute (like `type="submit"`) rather than adding a test-only id.
- New features should add at least one test per non-trivial `lib/` function and one
  smoke/interaction test per page/component with real logic, under the mirrored path in
  `src/test/`.

## General TypeScript/React conventions

- Strict typing: no `any`; prefer discriminated unions (see `Snippet` = `CodeSnippet |
  PromptSnippet`) with type guards (`isCodeSnippet`, `isPromptSnippet`) over optional
  fields when a value's shape depends on a type field.
- Functional components with hooks only; no class components.
- Keep components small and composable; extract a subcomponent once a page-level
  component mixes more than one visual concern (e.g. list rendering + a sidebar filter).
- Named exports for components/hooks/functions; avoid default exports except where a
  tool requires them (e.g. `App.tsx`'s root component, per Vite's template).

## Imports: always absolute, never relative

**Every import of a project file uses the `@/` alias, which points at `src/`. Do not use
relative specifiers (`./`, `../`) anywhere in the project** — not in components, hooks,
lib functions, contexts, or tests.

```ts
// Wrong
import { Button } from '../../components/ui/Button'
import { normalizeTag } from './tags'

// Right
import { Button } from '@/components/ui/Button'
import { normalizeTag } from '@/lib/tags'
```

The alias is wired in two places and both must stay in sync if `src/` ever moves:
`tsconfig.app.json` (`compilerOptions.paths`) and `vite.config.ts` (`resolve.alias`).
This applies to every file under `src/`, including `src/test/**`, with no exceptions —
a test importing the module it covers still uses `@/...`, never `../../lib/foo`.
