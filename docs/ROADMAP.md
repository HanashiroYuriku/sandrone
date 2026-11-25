# Roadmap

Sandrone is built in five phases. Each phase ends with `npm run check`, `npm run build` and
`npm run build:export` passing before the next one starts. Design decisions behind the
finished phases are recorded in [ARCHITECTURE.md](ARCHITECTURE.md).

| Phase                          | Status  |
| ------------------------------ | ------- |
| 1. Foundation                  | Done    |
| 2. Core library & UI kit       | Done    |
| 3. Layout shells & RBAC guards | Next    |
| 4. DataTable engine & forms    | Planned |
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

## Phase 3 — Layout shells & RBAC guards (next)

- **`src/features/auth/`**
  - Zustand store: current user, access token, active tenant. Token in `sessionStorage` for bearer mode; nothing stored client-side in cookie mode.
  - Zod login schema, `useAuth`/`useSession` hooks, `toAccessSubject()` mapping the user to `AccessSubject`.
  - Registers itself with `apiClient.configure({ getAccessToken, refreshSession, onSessionExpired, getTenantId })`.
  - Mock auth adapter for demo mode (`NEXT_PUBLIC_ENABLE_MOCK_API`).
- **`src/components/guards/`**
  - `AuthGuard`: client-side redirect to `/login?next=…`, skeleton while the session resolves.
  - `<PermissionGuard permission="items.create" fallback={null}>` built on `canAccess()`.
- **`src/config/navigation.ts`**: sidebar menu entries with an optional `access: AccessRule`, shared by the sidebar, breadcrumbs and command palette.
- **`(auth)` route group**: minimal centered layout, `/login`, `/forgot-password`.
- **`(dashboard)` route group**
  - `AppSidebar` (shadcn `sidebar`): collapsible with persisted state, Sheet drawer on mobile.
  - Topbar: dynamic breadcrumbs from `usePathname` + `navigation.ts`, theme toggle, tenant switcher (only when `NEXT_PUBLIC_MULTI_TENANT`), user menu.
  - Command palette (`cmdk`) on Cmd/Ctrl+K via `useKeyboardShortcut`.
- **`(kiosk)` route group**: fullscreen shell with `data-touch`, `KioskHeader` with online/offline indicator (`navigator.onLine`) and cashier/session info, split-view layout.
- **App-level files**: `app/error.tsx`, `app/not-found.tsx`; `app/page.tsx` becomes a client redirect to `/dashboard` (server redirects are unavailable in `export` mode).

## Phase 4 — DataTable engine & forms (planned)

- **`src/components/data-table/`** on `@tanstack/react-table` + `nuqs`:
  - Server-side pagination, sorting, debounced search and multi-select faceted filters, all synced to URL query params.
  - Column visibility toggle, row selection with a bulk action bar, empty state, loading skeleton.
  - Export slot/hook for CSV/Excel triggers.
- **`src/components/shared/`**: `ConfirmDialog`, `EmptyState`, `PageHeader`, `StatCard`, form field wrappers.
- **Form pattern**: React Hook Form + Zod schema shared with the API payload type; submit disabled while pending; `ApiError.fieldErrors` mapped onto form fields.

## Phase 5 — Reference features (planned)

- **In-browser mock API**, plugged in with `apiClient.configure({ fetch: mockFetch })` when `NEXT_PUBLIC_ENABLE_MOCK_API=true`, so it works in every build mode.
- **`/dashboard`**: KPI stat cards + responsive Recharts area/bar charts (shadcn Charts pattern).
- **`/items`** (`src/features/items/`): full CRUD on the DataTable, URL-synced filters, Sheet/Dialog create-edit form, `ConfirmDialog` delete with Sonner feedback, query-key factory.
- **`/kiosk`** (`src/features/kiosk/`): touch-friendly product grid, Zustand cart (add, increment, decrement, clear), responsive order summary, optimistic checkout.
- **README**: how to add a feature module and how to connect a real backend.

## Later (not scheduled)

- Vitest suite for `api-client` and `permissions`.
- `deploy/docker/Dockerfile` for the `standalone` build.
