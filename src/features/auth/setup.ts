import { env } from "@/config/env";
import { authApi } from "@/features/auth/api";
import { buildLoginHref, LOGIN_PATH } from "@/features/auth/redirect";
import { useAuthStore } from "@/features/auth/store";
import { apiClient } from "@/lib/api-client";

/**
 * Connects the auth feature to the API client: token injection, tenant header,
 * token refresh and session expiry. `src/lib` never imports features, so the auth
 * provider can be replaced by rewriting this feature alone.
 */
export function registerAuth(): void {
  const auth = () => useAuthStore.getState();

  apiClient.configure({
    getAccessToken: () => auth().tokens?.accessToken,

    getTenantId: env.NEXT_PUBLIC_MULTI_TENANT
      ? () => auth().tenantId ?? env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? null
      : undefined,

    refreshSession: async () => {
      const { tokens, user } = auth();
      if (!user) return false;
      if (env.NEXT_PUBLIC_AUTH_MODE === "bearer" && !tokens?.refreshToken) return false;

      const refreshed = await authApi.refresh(tokens?.refreshToken);
      if (refreshed) auth().setTokens(refreshed);
      return true;
    },

    onSessionExpired: () => {
      if (!auth().user) return;
      auth().clearSession();
      // A full navigation also drops every cached query from the old session.
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.assign(buildLoginHref());
      }
    },
  });
}
