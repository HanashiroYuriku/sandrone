# Architecture notes

Decisions behind the template, and the known pitfalls of its dependencies. Read this before
changing anything in `src/lib/`, the build setup or the dependency versions.

## Decisions

### 1. Hosting-agnostic: core features run in every build mode

The template builds as a Next.js server (`server`, default), a self-contained server
(`standalone`) or static files (`export`). One codebase serves all three, so core features
must avoid anything a static export cannot run:

- **Auth and RBAC guards run on the client.** They only decide what the UI shows; the backend
  must enforce access on every endpoint. The default auth mode is `bearer`, with the token in
  the browser, which a server-side `proxy.ts` couldn't read anyway.
- **Only `NEXT_PUBLIC_*` variables are read in the browser.** They are inlined at build time,
  so they are public, and each environment (staging, production) needs its own build.
- **Lists and details use query params** (`/items?id=5`, via `nuqs`), not dynamic segments
  (`/items/[id]`), which a static export can only build with `generateStaticParams`.
- **No `proxy.ts`, Route Handlers or Server Actions in core features.** Projects that ship
  as `server`/`standalone` may add them; note that `proxy.ts` makes `export` builds fail.
- **The mock API runs in the browser**, plugged in with `apiClient.configure({ fetch: mockFetch })`,
  not as Route Handlers.

### 2. npm

The repository uses `package-lock.json`; switching to pnpm or bun only needs a new lockfile.

### 3. Pinned below the latest major on purpose

| Package                 | Pinned    | Why                                                                                                |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `typescript`            | `~6.0.3`  | `typescript-eslint` (used by `eslint-config-next`) supports TypeScript `<6.1`; TypeScript 7 fails. |
| `eslint`                | `^9`      | `eslint-plugin-react`, `-import` and `-jsx-a11y` don't support ESLint 10 yet.                      |
| `@tanstack/react-table` | `^8.21.3` | v9 (stable since Aug 2026) has a different API; the shadcn DataTable pattern targets v8.           |

### 4. `cn` package instead of `clsx` + `tailwind-merge`

shadcn's `cn` package is a drop-in replacement for both, and the shadcn CLI now generates
components that import it directly (`from "cn"`). App code imports `cn` from `@/lib/utils`,
which re-exports it, so the implementation can be swapped in one place.

### 5. The API client knows nothing about auth

`src/lib/` never imports from `src/features/`. The auth feature plugs into the client with
`apiClient.configure({ getAccessToken, refreshSession, onSessionExpired, getTenantId })`,
so the auth provider can be replaced without touching the API layer.

### 6. Toasts through React Query `meta`

Queries and mutations declare `meta: { successMessage, errorMessage }`; the query cache shows
the toast. The `meta` shape is typed through React Query's `Register` interface. 401 errors
never toast, because the API client handles session expiry once.

### 7. Chart palette

`--chart-1` … `--chart-5` come from a validated colorblind-safe categorical palette, in fixed
order (blue, orange, aqua, yellow, magenta), with separate steps for dark mode. Keep the
order, and never use the status colors (`success`, `warning`, `destructive`) as chart series.

### 8. Density and touch modes through data attributes

`data-density="compact|comfortable"` and `data-touch` set CSS variables (`--density-*`,
`--touch-target`) on any container. The `Table` primitive already reads them.

### 9. Locale defaults

`id-ID`, `IDR` and `Asia/Jakarta`, set once in `src/config/site.ts`.

### 10. Client-side session and guards

- **Session storage.** The auth store persists the user, active tenant and (in bearer mode) the
  tokens to localStorage, so sessions survive reloads and new tabs — what ERP users expect when
  they open records in several tabs. Injected scripts can read localStorage, so production
  apps should prefer `NEXT_PUBLIC_AUTH_MODE=cookie` with httpOnly cookies when the backend
  supports it; in cookie mode no token is stored client-side.
- **Hydration.** Everything session-dependent waits for `useAuthHydrated()` (false during
  prerender and the first hydration pass), so server HTML and the first client render match.
  Guards show skeletons meanwhile.
- **Guards are layered.** `AuthGuard` (route group layout) requires a session; each page wraps
  itself in `PermissionGuard` with an `AccessDenied` fallback, because hiding a menu entry
  doesn't stop anyone from typing the URL. `GuestGuard` keeps signed-in users out of `/login`.
- **Redirects.** `?next=` only accepts same-origin paths (`getSafeRedirect`), so login can't be
  turned into an open redirect. A deliberate sign-out sets `signedOut`, so the guard sends the
  user to plain `/login` instead of remembering the current page for the next person.
- **Session expiry.** A 401 triggers one refresh attempt (deduplicated by the API client); if it
  fails, `onSessionExpired` clears the store and does a full navigation to `/login?next=…`,
  which also drops every cached query.
- **Permissions stay fresh.** `AuthGuard` re-reads `/auth/me` (5-minute stale time, refetch on
  focus), so roles changed on the server apply without signing in again.

### 11. Navigation config is the single source

`src/config/navigation.ts` drives the sidebar, breadcrumbs, command palette and the post-login
destination (the first page the user may open). Adding a page usually means one entry there
plus the page's own `PermissionGuard`.

### 12. In-browser mock backend

`src/mocks/createMockFetch` replaces `fetch` inside the API client, so the real request
pipeline (headers, refresh, error normalization, schemas) runs against mock handlers. It works
in every build mode, including static export. Each feature keeps its handlers next to its code
(`features/<name>/mock-handlers.ts`) and registers them in `src/mocks/index.ts`. Set
`NEXT_PUBLIC_ENABLE_MOCK_API=false` to talk to the real backend.

### 13. Persisted UI state renders the default first

`usePersistedState` (sidebar open/closed) and the other browser-state hooks return their
default during prerender and hydration, then switch to the stored value. A user who collapsed
the sidebar briefly sees it expanded on a full page load. Reading the cookie on the server
would avoid that, but only in `server` mode, so the template accepts the flash.

## Known pitfalls

- **lucide-react v1 renamed some icons**: `TriangleAlert` → `TriangleExclamationPoint`,
  `CircleAlert` → `CircleExclamationPoint`, `FileQuestion` → `FileQuestionMark`, `Home` → `House`;
  `Building2` and `Loader2` are gone (use `Building`, `LoaderCircle`). The `…Icon` aliases
  (`MoonIcon`) still exist. Check `node_modules/lucide-react/dist/lucide-react.d.ts` when unsure.
- **`CommandDialog` (radix-nova) is only the dialog frame.** Wrap its content in `<Command>`,
  or cmdk crashes with "Cannot read properties of undefined (reading 'subscribe')".
- **`SidebarProvider` doesn't include a `TooltipProvider`**; `AppProviders` supplies one.
- **Next.js 16.3+ error boundaries** receive `error: unknown` and `retry()` (not `reset()`, which still
  exists but doesn't re-fetch). Narrow `error` before reading `message` or `digest`.
- **Static export on Windows nests segment prefetch files.** Next.js 16.4 names them by replacing
  `/` with `.` in the segment path, but on Windows that path uses `\`, so it writes folders
  (`__next.!KGF1dGgp/login/__PAGE__.txt`) instead of flat files (`__next.!KGF1dGgp.login.__PAGE__.txt`)
  and every route prefetch 404s. `npm run build:export` flattens them after the build; a plain
  `next build` with `BUILD_OUTPUT=export` does not. Builds on Linux/macOS are unaffected.
- **Node.js 26 has an experimental global `localStorage`.** Code that may run during prerender must
  use `window.localStorage` (which throws on the server) rather than the bare global.
- **shadcn CLI**
  - It stops at an overwrite prompt when run non-interactively. Use `--overwrite` only for files that may be replaced.
  - Don't overwrite `src/components/ui/sonner.tsx`; the generated version uses old icon names.
  - It has downgraded `recharts` in `package.json` before. Review the `package.json` diff after every `shadcn add`.
- **`src/hooks/use-mobile.ts` was rewritten** on `useSyncExternalStore` (via `useMediaQuery`). If the
  shadcn CLI overwrites it, restore this version: the generated one calls `setState` inside an effect.
- **Next.js 16 changes**: `middleware` is now `proxy`; `next lint` is gone (use `eslint`);
  `next typegen` generates global types such as `LayoutProps<"/">`. Version-matched docs ship
  in `node_modules/next/dist/docs/`.
- **`next build` empties `.next/`**, so run `npm run start:standalone` right after `npm run build:standalone`.
- **npm blocks the `unrs-resolver` postinstall script.** Harmless: ESLint works without it.
- **Windows**: after installing Node.js, quit VS Code completely (File → Exit) so terminals pick up the new `PATH`.
