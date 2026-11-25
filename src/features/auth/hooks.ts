"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getHomeHref } from "@/config/navigation";
import { authApi, authKeys } from "@/features/auth/api";
import { LOGIN_PATH, readNextParam } from "@/features/auth/redirect";
import type { AuthUser, ForgotPasswordFormValues, Tenant } from "@/features/auth/schemas";
import { useAuthHydrated, useAuthStore } from "@/features/auth/store";
import { type AccessRule, type AccessSubject, canAccess } from "@/lib/permissions";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function toAccessSubject(user: AuthUser): AccessSubject {
  return { roles: user.roles, permissions: user.permissions };
}

export interface Session {
  status: AuthStatus;
  user: AuthUser | null;
  /** What permission checks need; `null` when signed out. */
  subject: AccessSubject | null;
  activeTenant: Tenant | null;
}

export function useSession(): Session {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);
  const tenantId = useAuthStore((state) => state.tenantId);

  return useMemo(() => {
    const visibleUser = hydrated ? user : null;
    return {
      status: !hydrated ? "loading" : user ? "authenticated" : "unauthenticated",
      user: visibleUser,
      subject: visibleUser ? toAccessSubject(visibleUser) : null,
      activeTenant: visibleUser?.tenants.find((tenant) => tenant.id === tenantId) ?? null,
    };
  }, [hydrated, user, tenantId]);
}

/** True when the signed-in user passes the rule. Always false while the session loads. */
export function useCan(rule: AccessRule | undefined): boolean {
  const { status, subject } = useSession();
  return status === "authenticated" && canAccess(subject, rule);
}

/**
 * Re-reads the user from `/auth/me` so roles and permissions changed on the server
 * apply without a new login. A 401 here ends the session through the API client.
 */
export function useCurrentUserSync(enabled: boolean): void {
  useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const user = await authApi.me();
      useAuthStore.getState().setUser(user);
      return user;
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, tokens }) => {
      queryClient.clear();
      useAuthStore.getState().setSession(user, tokens);
      const destination = readNextParam() ?? getHomeHref(toAccessSubject(user)) ?? "/";
      router.replace(destination);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Signing out locally must work even when the server call fails.
      await authApi.logout().catch(() => undefined);
    },
    onSettled: () => {
      useAuthStore.getState().clearSession({ signedOut: true });
      queryClient.clear();
      router.replace(LOGIN_PATH);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => authApi.forgotPassword(values),
  });
}

/** Switches the active tenant and drops cached data, which belongs to the old tenant. */
export function useSwitchTenant() {
  const queryClient = useQueryClient();

  return (tenantId: string) => {
    if (useAuthStore.getState().tenantId === tenantId) return;
    useAuthStore.getState().setTenant(tenantId);
    void queryClient.resetQueries();
  };
}
