# Sandrone - Next.js Frontend Template

Sandrone is a frontend base template built on Next.js (App Router) and TypeScript. It provides one scalable, strictly typed and modular foundation for several kinds of business applications:

- **Multi-tenant SaaS**: optional `X-Tenant-ID` header and tenant switcher
- **ERP**: dense data tables, CRUD flows, URL-synced filters
- **Kiosk / POS**: fullscreen, touch-friendly screens and a cart flow
- **Admin dashboards**: KPI cards and charts

Every part of the template is plain, editable code owned by the developer: no forced SDK, no black-box abstractions.

> **Status:** in development, phase 3 of 5 complete. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Technical Specifications

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Language:** [TypeScript 6](https://www.typescriptlang.org/) (`strict`, `noUncheckedIndexedAccess`, no `any`)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with CSS-variable design tokens
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives, `radix-nova` style), [lucide-react](https://lucide.dev/), [next-themes](https://github.com/pacocoursey/next-themes), [Sonner](https://sonner.emilkowal.ski/), [cmdk](https://cmdk.paco.me/)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query) + a zero-dependency typed `fetch` client
- **Tables:** [TanStack Table](https://tanstack.com/table) v8
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/)
- **State Management:** [Zustand](https://zustand.docs.pmnd.rs/) (client state), [nuqs](https://nuqs.dev/) (type-safe URL search params)
- **Charts:** [Recharts](https://recharts.org/) (shadcn Charts pattern)
- **Code Quality:** ESLint 9 (Next.js core-web-vitals + TypeScript), Prettier + Tailwind plugin

## Core Features

1. **Feature-Based Modular Architecture:** Domain code lives in self-contained modules under `src/features/`, combined with Next.js route groups for the auth, dashboard and kiosk shells.
2. **Hosting-Agnostic Builds:** Three build modes (`server`, `standalone`, `export`) from one codebase. Core features never depend on server-only APIs, so the same app deploys to Vercel, Docker or a static host.
3. **Typed API Client:** A `fetch` wrapper with a normalized `ApiError` (status, code, field errors), pluggable auth (Bearer token or cookies), an optional `X-Tenant-ID` header, interceptors, timeouts, optional Zod response validation and a 401 refresh hook that refreshes the session only once for concurrent requests.
4. **Provider-Agnostic RBAC:** `resource.action` permissions with wildcards (`*`, `items.*`, `*.read`) and declarative access rules for guards and navigation.
5. **Validated Environment:** All environment variables are parsed with Zod at build time; an invalid value fails the build.
6. **Design Tokens:** A neutral light/dark palette, status colors, a colorblind-safe chart palette, and density (`data-density`) and touch (`data-touch`) modes for ERP tables and kiosk screens.
7. **Query Conventions:** Toast feedback through typed React Query `meta`, and no retries for client errors (4xx) or mutations.

## Project Structure

```text
sandrone/
├── deploy/                  # Optional host-specific config (e.g. iis/web.config for static export)
├── docs/
│   ├── ARCHITECTURE.md      # Design decisions and known pitfalls
│   └── ROADMAP.md           # Phase status and planned work
├── scripts/
│   └── build.mjs            # Cross-platform build for each BUILD_OUTPUT mode
├── src/
│   ├── app/                 # Routes. Layouts and pages are Server Components by default
│   │   ├── (auth)/          # Minimal centered layout: /login, /forgot-password
│   │   ├── (dashboard)/     # ERP/SaaS shell: sidebar, topbar, breadcrumbs, Cmd+K (/dashboard, /items)
│   │   ├── (kiosk)/         # Fullscreen, touch-friendly shell (/kiosk)
│   │   ├── error.tsx        # Error boundary; global-error.tsx and not-found.tsx alongside
│   │   ├── globals.css      # Design tokens, density/touch modes, custom utilities
│   │   ├── layout.tsx       # Root layout with AppProviders
│   │   └── page.tsx         # Sends "/" to the user's first allowed page, or to login
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (edit them directly)
│   │   ├── data-table/      # [Phase 4] TanStack Table engine with URL sync
│   │   ├── layout/          # Dashboard/kiosk shells, sidebar, topbar, command palette
│   │   ├── guards/          # AuthGuard, GuestGuard, PermissionGuard, AccessDenied
│   │   └── shared/          # [Phase 4] ConfirmDialog, EmptyState, PageHeader, StatCard
│   ├── config/              # env.ts (Zod-validated env), site.ts, navigation.ts (menu + access rules)
│   ├── features/
│   │   ├── auth/            # Session store, login/logout hooks, API, schemas, forms, mock handlers
│   │   ├── items/           # [Phase 5] Reference CRUD module
│   │   └── kiosk/           # [Phase 5] Reference kiosk/POS module
│   ├── hooks/               # useDebounce, useMediaQuery, useKeyboardShortcut, usePersistedState, ...
│   ├── lib/                 # api-client, permissions, query-client, utils
│   ├── mocks/               # In-browser mock backend used when NEXT_PUBLIC_ENABLE_MOCK_API=true
│   ├── providers/           # AppProviders: theme, nuqs, React Query, tooltips, toaster, API setup
│   └── types/               # Shared API contracts: PaginatedResponse<T>, ListParams, ...
├── .env.example             # Environment variables template
├── components.json          # shadcn/ui CLI configuration
├── next.config.ts           # Build mode switch (BUILD_OUTPUT)
└── package.json
```

## Getting Started

### 1. Requirements

- [Node.js](https://nodejs.org/) 20.9 or newer (latest LTS recommended)
- npm

### 2. Install Dependencies

```bash
git clone https://github.com/HanashiroYuriku/sandrone.git
cd sandrone
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and adjust the values:

```bash
cp .env.example .env.local   # Windows (cmd): copy .env.example .env.local
```

| Variable                        | Default                     | Description                                                            |
| ------------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `BUILD_OUTPUT`                  | `server`                    | Build mode: `server`, `standalone` or `export`                         |
| `NEXT_PUBLIC_APP_URL`           | `http://localhost:3000`     | Public URL of the frontend                                             |
| `NEXT_PUBLIC_API_BASE_URL`      | `http://localhost:8080/api` | Backend base URL (absolute URL or a same-origin path such as `/api`)   |
| `NEXT_PUBLIC_AUTH_MODE`         | `bearer`                    | `bearer` (Authorization header) or `cookie` (`credentials: "include"`) |
| `NEXT_PUBLIC_ENABLE_MOCK_API`   | `true`                      | Serve the reference features from the in-browser mock API              |
| `NEXT_PUBLIC_MULTI_TENANT`      | `false`                     | Send the `X-Tenant-ID` header and show the tenant switcher             |
| `NEXT_PUBLIC_DEFAULT_TENANT_ID` | —                           | Default tenant id                                                      |

(Note: `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time. They are public, so never put secrets in them.)

To add a variable, update three places: `.env.example`, `schema` and `runtimeEnv` in `src/config/env.ts`. Reference it literally (`process.env.NEXT_PUBLIC_X`) so Next.js can inline it.

### 4. Run the Development Server

```bash
npm run dev
```

Open `http://localhost:3000`. With the mock API on (the default), sign in with one of the demo accounts; the login page also offers them as one-click buttons. The password for every account is `password`.

| Name             | Account                   | Role    | Can open                      |
| ---------------- | ------------------------- | ------- | ----------------------------- |
| Hanashiro Yuriku | `admin@seleniasync.com`   | admin   | Everything (`*`), two tenants |
| Yuriku           | `manager@seleniasync.com` | manager | Dashboard, Items, Kiosk       |
| Riku             | `cashier@seleniasync.com` | cashier | Items (read-only), Kiosk      |

Set `NEXT_PUBLIC_ENABLE_MOCK_API=false` to sign in against your real backend instead.

## Build Modes

The build target is chosen with `BUILD_OUTPUT` (environment variable or `.env.local`):

| Mode               | Output                                                    | Use for                                       |
| ------------------ | --------------------------------------------------------- | --------------------------------------------- |
| `server` (default) | Regular Next.js server (`next start`)                     | Vercel, Netlify, Railway, any Node.js host    |
| `standalone`       | Self-contained server in `.next/standalone`, minimal deps | Docker images, VPS, self-hosting              |
| `export`           | Static HTML/JS in `out/`, no Node.js server               | Nginx, S3/CloudFront, GitHub Pages, IIS, CDNs |

Core template features run in **every** mode: auth/RBAC guards run on the client (the backend must still enforce access), only `NEXT_PUBLIC_*` variables are read in the browser, and lists use query params instead of dynamic route segments. Projects built as `server` or `standalone` are free to add server-only features (`proxy.ts`, Route Handlers, Server Actions, request-time rendering). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Deployment

| Target                    | Steps                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vercel / Next.js host** | Connect the repository; the platform runs `npm run build`. Set the `NEXT_PUBLIC_*` variables in its dashboard.                             |
| **Node.js server**        | `npm run build`, then `npm start` (set the port with `PORT`).                                                                              |
| **Docker / self-hosting** | `npm run build:standalone`, copy `.next/standalone` to the server, run `node server.js`.                                                   |
| **Static hosting**        | `npm run build:export` (not a plain `next build`, see [ARCHITECTURE](docs/ARCHITECTURE.md#known-pitfalls)), upload the contents of `out/`. |

The [deploy/](deploy/) folder holds optional host-specific config, such as [deploy/iis/web.config](deploy/iis/web.config) (copy it into `out/` when hosting a static export on IIS). Delete the folder if you don't need it.

## Scripts

| Command                                                 | Description                                  |
| ------------------------------------------------------- | -------------------------------------------- |
| `npm run dev`                                           | Development server                           |
| `npm run build` → `npm start`                           | Build and run, using the `BUILD_OUTPUT` mode |
| `npm run build:standalone` → `npm run start:standalone` | Self-contained server build                  |
| `npm run build:export`                                  | Static export to `out/`                      |
| `npm run check`                                         | Typecheck + lint + format check              |
| `npm run typecheck`                                     | `next typegen` + `tsc --noEmit`              |
| `npm run lint` / `npm run lint:fix`                     | ESLint                                       |
| `npm run format` / `npm run format:check`               | Prettier                                     |

## Usage Examples

### API Client

```ts
import { apiClient, ApiError } from "@/lib/api-client";

// Validate the response at runtime with any schema that has `parse` (e.g. Zod)
const item = await apiClient.get("/items/1", { schema: itemSchema });

try {
  await apiClient.post("/items", payload);
} catch (error) {
  if (ApiError.is(error) && error.isValidationError) {
    console.error(error.fieldErrors); // { name: ["Required"], ... }
  }
}
```

Auth and tenancy plug in from the outside, so the client never depends on an auth provider:

```ts
apiClient.configure({
  getAccessToken: () => session.accessToken,
  refreshSession: async () => refreshTokens(), // return true to retry the failed request
  onSessionExpired: () => router.replace("/login"),
  getTenantId: () => tenantStore.getState().tenantId,
});
```

### Permissions (RBAC)

Permissions use the `resource.action` format. Granted permissions may use wildcards (`*`, `items.*`, `*.read`).

```ts
import { canAccess, hasPermission } from "@/lib/permissions";

hasPermission(user, "items.delete");
canAccess(user, { anyPermission: ["items.update", "items.delete"], roles: ["admin"] });
```

In components, use the guards and hooks built on top of it:

```tsx
import { AccessDenied } from "@/components/guards/access-denied";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useCan } from "@/features/auth/hooks";

// Guard a whole page (hiding the menu entry alone doesn't stop direct URLs)
<PermissionGuard permission="reports.read" fallback={<AccessDenied />}>
  <ReportsView />
</PermissionGuard>

// Hide a single control
<PermissionGuard permission="items.create">
  <Button>New item</Button>
</PermissionGuard>

// Or branch in code
const canDelete = useCan({ permission: "items.delete" });
```

To add a page to the menu, add an entry with an `access` rule to `src/config/navigation.ts`; the sidebar, breadcrumbs, command palette and post-login redirect pick it up.

### Query Feedback

Declare toast messages on the query or mutation instead of repeating try/catch blocks:

```ts
useMutation({
  mutationFn: createItem,
  meta: { successMessage: "Item saved", errorMessage: "Could not save the item" },
});
```

### Density and Touch Modes

```tsx
<section data-density="compact">{/* tables inside become denser */}</section>
<main data-touch>{/* larger hit targets for kiosk screens */}</main>
```

## Development Protocol

- **Server Components by default.** Push `"use client"` down to the interactive leaf components.
- **No `any`.** ESLint reports it as an error.
- **Forms** share one Zod schema between form state and the API payload type, and disable submit while a request is pending.
- **`src/components/ui/` is editable.** Change the primitives directly instead of wrapping them in extra layers.
- **Adding shadcn components:** `npx shadcn@latest add <component>`. Don't overwrite `ui/sonner.tsx`, and review the `package.json` diff afterwards (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).
- **Import `cn` from `@/lib/utils`.** Components generated by the shadcn CLI import it from the `cn` package directly, which is the same implementation.

### Pre-Push Checklist

Before committing and pushing, run the verification suite locally:

```bash
# 1. Typecheck, lint and check formatting
npm run check

# 2. Verify the server build
npm run build

# 3. Verify the static export still builds
npm run build:export
```

## Credits & Acknowledgements

- **Hanashiro Yuriku | Dionisius Geovanni Caesario**
- **Claude Code** - _AI Pair Programmer_
  Implemented the template's foundation, core library and UI integration under the author's direction, verifying every phase with type checks, linting and builds.
- **Gemini** - _AI Pair Programmer_
  Served as a technical consultant and coding assistant, providing architectural insights and collaborative debugging throughout the development journey.

  **Disclaimer:** _The name Sandrone used in this template is inspired by a character from Genshin Impact. This project is open-source, purely for personal/educational purposes, and is not affiliated with, endorsed, or sponsored by HoYoverse/Cognosphere._
