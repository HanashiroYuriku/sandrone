import { apiClient } from "@/lib/api-client";

import {
  authUserSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  loginResponseSchema,
  refreshResponseSchema,
} from "@/features/auth/schemas";

/**
 * Auth endpoints. Adjust the paths and payloads to your backend; the rest of the
 * feature only depends on these functions and the schemas.
 */
export const authApi = {
  login: (values: LoginFormValues) =>
    apiClient.post("/auth/login", values, { schema: loginResponseSchema, skipAuth: true }),

  /** Bearer mode sends the refresh token; cookie mode relies on the refresh cookie. */
  refresh: (refreshToken?: string) =>
    apiClient.post("/auth/refresh", refreshToken ? { refreshToken } : undefined, {
      schema: refreshResponseSchema,
      skipAuth: true,
    }),

  me: () => apiClient.get("/auth/me", { schema: authUserSchema }),

  logout: () => apiClient.post<void>("/auth/logout", undefined, { skipAuth: true }),

  forgotPassword: (values: ForgotPasswordFormValues) =>
    apiClient.post<void>("/auth/forgot-password", values, { skipAuth: true }),
};

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};
