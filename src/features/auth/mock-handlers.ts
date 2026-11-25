import type { AuthUser } from "@/features/auth/schemas";
import { forgotPasswordFormSchema, loginFormSchema } from "@/features/auth/schemas";
import { type MockHandler, mockError, mockJson, mockNoContent } from "@/mocks/mock-fetch";

/** Demo accounts for the mock API. Every account uses the password below. */
export const DEMO_PASSWORD = "password";

const seleniasync = { id: "seleniasync", name: "Seleniasync" };
const seleniasyncRetail = { id: "seleniasync-retail", name: "Seleniasync Retail" };

export const demoUsers: readonly AuthUser[] = [
  {
    id: "u-admin",
    name: "Hanashiro Yuriku",
    email: "admin@seleniasync.com",
    avatarUrl: null,
    roles: ["admin"],
    permissions: ["*"],
    tenants: [seleniasync, seleniasyncRetail],
  },
  {
    id: "u-manager",
    name: "Yuriku",
    email: "manager@seleniasync.com",
    avatarUrl: null,
    roles: ["manager"],
    permissions: ["dashboard.read", "items.*", "kiosk.access"],
    tenants: [seleniasync],
  },
  {
    id: "u-cashier",
    name: "Riku",
    email: "cashier@seleniasync.com",
    avatarUrl: null,
    roles: ["cashier"],
    permissions: ["kiosk.access", "items.read"],
    tenants: [seleniasync],
  },
];

const ACCESS_TOKEN_TTL_MS = 15 * 60_000;
/** Cookie mode can't read httpOnly cookies in the browser, so the mock remembers the user here. */
const COOKIE_SESSION_KEY = "sandrone-mock-session";

function issueTokens(userId: string) {
  return {
    accessToken: `mock-access.${userId}.${Date.now() + ACCESS_TOKEN_TTL_MS}`,
    refreshToken: `mock-refresh.${userId}`,
  };
}

function findUser(id: string | undefined): AuthUser | undefined {
  return demoUsers.find((user) => user.id === id);
}

/**
 * Resolves the caller from the bearer token, or from the mock cookie session.
 * Exported so other features' mock handlers can protect their endpoints.
 */
export function getMockUser(request: Request): AuthUser | undefined {
  const header = request.headers.get("Authorization");
  if (header?.startsWith("Bearer ")) {
    const [kind, userId, expiresAt] = header.slice("Bearer ".length).split(".");
    if (kind !== "mock-access" || Number(expiresAt) < Date.now()) return undefined;
    return findUser(userId);
  }
  return findUser(window.localStorage.getItem(COOKIE_SESSION_KEY) ?? undefined);
}

export const authMockHandlers: MockHandler[] = [
  {
    method: "POST",
    path: "/auth/login",
    handle: async ({ body }) => {
      const parsed = loginFormSchema.safeParse(await body());
      if (!parsed.success) {
        return mockError(422, "Check the highlighted fields.", {
          code: "VALIDATION_ERROR",
          errors: Object.fromEntries(
            parsed.error.issues.map((issue) => [issue.path.join("."), [issue.message]]),
          ),
        });
      }

      const user = demoUsers.find(
        (candidate) => candidate.email.toLowerCase() === parsed.data.email.toLowerCase(),
      );
      if (!user || parsed.data.password !== DEMO_PASSWORD) {
        return mockError(401, "Incorrect email or password.", { code: "INVALID_CREDENTIALS" });
      }

      window.localStorage.setItem(COOKIE_SESSION_KEY, user.id);
      return mockJson({ user, tokens: issueTokens(user.id) });
    },
  },
  {
    method: "POST",
    path: "/auth/refresh",
    handle: async ({ body }) => {
      const payload = await body();
      const token =
        typeof payload === "object" && payload !== null && "refreshToken" in payload
          ? String(payload.refreshToken)
          : undefined;

      if (token === undefined) {
        // Cookie mode: the "refresh cookie" is the mock session itself.
        return window.localStorage.getItem(COOKIE_SESSION_KEY)
          ? mockNoContent()
          : mockError(401, "Session expired.");
      }

      const [kind, userId] = token.split(".");
      const user = kind === "mock-refresh" ? findUser(userId) : undefined;
      return user ? mockJson(issueTokens(user.id)) : mockError(401, "Session expired.");
    },
  },
  {
    method: "GET",
    path: "/auth/me",
    handle: ({ request }) => {
      const user = getMockUser(request);
      return user ? mockJson(user) : mockError(401, "Not signed in.");
    },
  },
  {
    method: "POST",
    path: "/auth/logout",
    handle: () => {
      window.localStorage.removeItem(COOKIE_SESSION_KEY);
      return mockNoContent();
    },
  },
  {
    method: "POST",
    path: "/auth/forgot-password",
    handle: async ({ body }) => {
      const parsed = forgotPasswordFormSchema.safeParse(await body());
      if (!parsed.success) return mockError(422, "Enter a valid email address.");
      // Always succeed, so the endpoint doesn't reveal which emails have accounts.
      return mockNoContent();
    },
  },
];
