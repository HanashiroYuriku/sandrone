# Roadmap

Sandrone is built in five phases. Each phase ends with `npm run check`, `npm run build` and
`npm run build:export` passing before the next one starts. Design decisions behind the
finished phases are recorded in [ARCHITECTURE.md](ARCHITECTURE.md).

| Phase                          | Status  |
| ------------------------------ | ------- |
| 1. Foundation                  | Done    |
| 2. Core library & UI kit       | Done    |
| 3. Layout shells & RBAC guards | Done    |
| 4. DataTable engine & forms    | Next    |
| 5. Reference features          | Planned |

## Phase 1 — Foundation (done)

- `package.json`, strict `tsconfig.json`, ESLint (Next core-web-vitals + TypeScript, `no-explicit-any`), Prettier with the Tailwind plugin.
- `src/config/env.ts` (Zod-validated env), `src/config/site.ts` (metadata, locale, currency, theme).
- `src/app/globals.css` design tokens: neutral light/dark palette, status colors, colorblind-safe chart palette, density and touch modes.
- `AppProviders`: next-themes, nuqs, TanStack Query (+ devtools), Sonner toaster.

## Phase 2 — Core library & UI kit (done)

- `src/lib/api-client.ts`, `src/lib/permissions.ts`, `src/lib/query-client.ts`, `src/lib/utils.ts`.
- `src/types/api.ts` shared API contracts.
- Hooks: `useDebounce`, `useMediaQuery`, `useKeyboardShortcut`, `useIsMobile`.
- 33 shadcn/ui primitives in `src/components/ui/` (style `radix-nova`).
- Build modes: `server` (default), `standalone`, `export`.

## Phase 3 — Layout shells & RBAC guards (done)

- **`src/features/auth/`**
  - `schemas.ts`: Zod response and form schemas; every auth type is inferred from them.
  - `store.ts`: Zustand store (user, tokens, active tenant) persisted to localStorage; tokens only in bearer mode.
  - `hooks.ts`: `useSession`, `useCan`, `useLogin`, `useLogout`, `useForgotPassword`, `useSwitchTenant`, `useCurrentUserSync` (re-reads `/auth/me`).
  - `setup.ts`: plugs token injection, tenant header, refresh and session expiry into the API client.
  - `redirect.ts`: safe `?next=` handling (same-origin paths only).
  - `mock-handlers.ts`: demo accounts (admin, manager, cashier) for the mock API.
  - Components: login form (server field errors mapped onto inputs, demo account shortcuts), forgot-password form, home redirect.
- **`src/mocks/`**: in-browser mock backend (`createMockFetch`) with path params, latency and abort support. Pulled forward from phase 5 because login needs it.
- **`src/components/guards/`**: `AuthGuard`, `GuestGuard`, `PermissionGuard`, `AccessDenied`.
- **`src/config/navigation.ts`**: menu with `access` rules; drives the sidebar, breadcrumbs, command palette and the post-login home page.
- **`(auth)`**: centered layout, `/login`, `/forgot-password`.
- **`(dashboard)`**: `DashboardShell` with collapsible sidebar (state kept in localStorage, Sheet on mobile), tenant switcher (multi-tenant only), user menu with theme choice, breadcrumbs, search button, Cmd/Ctrl+K command palette.
- **`(kiosk)`**: fullscreen shell with `data-touch`, `KioskHeader` (online/offline, clock, cashier, fullscreen toggle, exit or sign out) and `KioskSplitView`.
- **App files**: `app/page.tsx` (client redirect to the user's home page), `error.tsx` (Next 16 `retry`), `global-error.tsx`, `not-found.tsx`.
- **Pages**: `/dashboard`, `/items` and `/kiosk` render their permission-guarded frame; phase 5 fills them with the reference features.
- **Shared hooks**: `usePersistedState`, `useOnlineStatus`, `useNow`, `useFullscreen`, `useIsApplePlatform`.
- **Verified** with a browser run against both `export` and `server` builds: redirects, login errors, `?next=` and open-redirect protection, per-role menus, access denied, command palette, kiosk, sign out, sidebar persistence, theme, 404, mobile drawer, and no console errors.

## Phase 4 — DataTable engine & forms (next)

- **`src/components/data-table/`** on `@tanstack/react-table` + `nuqs`:
  - Server-side pagination, sorting, debounced search and multi-select faceted filters, all synced to URL query params.
  - Column visibility toggle, row selection with a bulk action bar, empty state, loading skeleton.
  - Export slot/hook for CSV/Excel triggers.
- **`src/components/shared/`**: `ConfirmDialog`, `EmptyState`, `PageHeader`, `StatCard`, form field wrappers.
- **Form pattern**: React Hook Form + Zod schema shared with the API payload type; submit disabled while pending; `ApiError.fieldErrors` mapped onto form fields.

## Phase 5 — Reference features (planned)

- **Mock handlers** for items, dashboard metrics and kiosk products, registered in `src/mocks/index.ts` (the mock backend itself exists since phase 3). Protect them with `getMockUser()` from the auth mock.
- **`/dashboard`**: KPI stat cards + responsive Recharts area/bar charts (shadcn Charts pattern).
- **`/items`** (`src/features/items/`): full CRUD on the DataTable, URL-synced filters, Sheet/Dialog create-edit form, `ConfirmDialog` delete with Sonner feedback, query-key factory.
- **`/kiosk`** (`src/features/kiosk/`): touch-friendly product grid, Zustand cart (add, increment, decrement, clear), responsive order summary, optimistic checkout.
- **README**: how to add a feature module and how to connect a real backend.

## Later (not scheduled)

- Vitest suite for `api-client` and `permissions`, and a Playwright suite for the auth/RBAC flows verified in phase 3.
- `deploy/docker/Dockerfile` for the `standalone` build.
