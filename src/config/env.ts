import { z } from "zod";

/**
 * Zod-validated environment variables.
 *
 * This app is a static export, so every variable is public and inlined at build
 * time. Next.js only inlines `process.env.NEXT_PUBLIC_*` when it is written out
 * literally, which is why each one is listed by name below instead of passing
 * `process.env` whole.
 *
 * To add a variable: add it to `.env.example`, to `schema`, and to `runtimeEnv`.
 */

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .trim()
    .min(1)
    .refine((value) => value.startsWith("/") || URL.canParse(value), {
      message: "Must be an absolute URL or a path starting with '/'",
    })
    .transform((value) => value.replace(/\/+$/, ""))
    .default("http://localhost:8080/api"),
  NEXT_PUBLIC_AUTH_MODE: z.enum(["bearer", "cookie"]).default("bearer"),
  NEXT_PUBLIC_ENABLE_MOCK_API: booleanString.default(true),
  NEXT_PUBLIC_MULTI_TENANT: booleanString.default(false),
  NEXT_PUBLIC_DEFAULT_TENANT_ID: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type Env = z.infer<typeof schema>;

/** Empty strings from .env files mean "not set", so the schema defaults apply. */
function unsetIfEmpty(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

const runtimeEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: unsetIfEmpty(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_API_BASE_URL: unsetIfEmpty(process.env.NEXT_PUBLIC_API_BASE_URL),
  NEXT_PUBLIC_AUTH_MODE: unsetIfEmpty(process.env.NEXT_PUBLIC_AUTH_MODE),
  NEXT_PUBLIC_ENABLE_MOCK_API: unsetIfEmpty(process.env.NEXT_PUBLIC_ENABLE_MOCK_API),
  NEXT_PUBLIC_MULTI_TENANT: unsetIfEmpty(process.env.NEXT_PUBLIC_MULTI_TENANT),
  NEXT_PUBLIC_DEFAULT_TENANT_ID: unsetIfEmpty(process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID),
} satisfies Record<keyof Env, string | undefined>;

const parsed = schema.safeParse(runtimeEnv);

if (!parsed.success) {
  // Fails the build (and the dev server) loudly instead of shipping a broken bundle.
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env: Readonly<Env> = Object.freeze(parsed.data);

export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
