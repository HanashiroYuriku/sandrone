import { z } from "zod";

import type { GrantedPermission } from "@/lib/permissions";

/* Response schemas: validate what the backend sends, and derive the types from them. */

const grantedPermissionSchema = z.custom<GrantedPermission>(
  (value) => typeof value === "string" && (value === "*" || /^[^.\s]+\.[^.\s]+$/.test(value)),
  { message: 'Permissions must look like "resource.action" or "*"' },
);

export const tenantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  avatarUrl: z.url().nullish(),
  roles: z.array(z.string()),
  permissions: z.array(grantedPermissionSchema),
  tenants: z.array(tenantSchema).default([]),
});

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

/** In cookie mode the server sets httpOnly cookies and `tokens` is omitted. */
export const loginResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema.optional(),
});

/** Cookie-mode refresh endpoints usually answer 204, hence nullish. */
export const refreshResponseSchema = authTokensSchema.nullish();

export type Tenant = z.infer<typeof tenantSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/* Form schemas: shared by the form state and the request payload. */

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordFormSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
