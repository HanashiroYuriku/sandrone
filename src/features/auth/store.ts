import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { env } from "@/config/env";
import type { AuthTokens, AuthUser } from "@/features/auth/schemas";

interface AuthState {
  user: AuthUser | null;
  /** Bearer mode only. Cookie mode keeps credentials in httpOnly cookies. */
  tokens: AuthTokens | null;
  /** Active tenant for multi-tenant apps. */
  tenantId: string | null;
  /**
   * True when the session ended because the user signed out (not persisted). Guards use
   * it to go to plain /login instead of remembering the current page as `?next=`.
   */
  signedOut: boolean;
}

interface AuthActions {
  setSession: (user: AuthUser, tokens?: AuthTokens | null) => void;
  setUser: (user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
  setTenant: (tenantId: string) => void;
  clearSession: (options?: { signedOut?: boolean }) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = { user: null, tokens: null, tenantId: null, signedOut: false };

/** Keeps the current tenant if the user still belongs to it, else the default or the first one. */
function resolveTenant(user: AuthUser, current: string | null): string | null {
  const ids = user.tenants.map((tenant) => tenant.id);
  if (current && ids.includes(current)) return current;
  const fallback = env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
  if (fallback && ids.includes(fallback)) return fallback;
  return ids[0] ?? null;
}

/**
 * Client-side session state, persisted to localStorage so the session survives
 * reloads and new tabs. Anything in localStorage is readable by injected scripts:
 * prefer NEXT_PUBLIC_AUTH_MODE=cookie (httpOnly cookies) when the backend supports it.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (user, tokens) =>
        set((state) => ({
          user,
          tokens: tokens ?? null,
          tenantId: resolveTenant(user, state.tenantId),
          signedOut: false,
        })),
      setUser: (user) => set((state) => ({ user, tenantId: resolveTenant(user, state.tenantId) })),
      setTokens: (tokens) => set({ tokens }),
      setTenant: (tenantId) => set({ tenantId }),
      clearSession: (options) => set({ ...initialState, signedOut: options?.signedOut ?? false }),
    }),
    {
      name: "sandrone-auth",
      version: 1,
      // `window.` on purpose: during prerender it throws, which zustand treats as "no
      // storage", instead of touching Node's experimental global localStorage.
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        user: state.user,
        tenantId: state.tenantId,
        tokens: env.NEXT_PUBLIC_AUTH_MODE === "bearer" ? state.tokens : null,
      }),
    },
  ),
);

/**
 * False during prerender and the first hydration pass, true once the persisted session
 * has been read. Gate anything session-dependent on it to avoid hydration mismatches.
 */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
