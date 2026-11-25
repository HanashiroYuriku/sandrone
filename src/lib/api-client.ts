import { env } from "@/config/env";
import type { ApiErrorBody, FieldErrors } from "@/types/api";

/* -------------------------------------------------------------------------- */
/* ApiError                                                                    */
/* -------------------------------------------------------------------------- */

export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  INVALID_RESPONSE: "INVALID_RESPONSE",
  HTTP_ERROR: "HTTP_ERROR",
} as const;

export interface ApiErrorInit {
  status: number;
  message: string;
  code?: string;
  fieldErrors?: FieldErrors;
  /** Raw response body (or the thrown value) for debugging. */
  details?: unknown;
  cause?: unknown;
}

/**
 * The only error type the API layer throws (apart from AbortError on cancel).
 * `status` is 0 when no HTTP response was received (network failure, timeout).
 */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldErrors;
  readonly details: unknown;

  constructor({ status, message, code, fieldErrors, details, cause }: ApiErrorInit) {
    super(message, { cause });
    this.status = status;
    this.code = code ?? API_ERROR_CODES.HTTP_ERROR;
    this.fieldErrors = fieldErrors ?? {};
    this.details = details;
  }

  static is(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isValidationError(): boolean {
    return this.status === 422 || (this.status === 400 && Object.keys(this.fieldErrors).length > 0);
  }
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** A user-facing message for any thrown value. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/* -------------------------------------------------------------------------- */
/* Error body normalization                                                    */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Accepts the common validation shapes:
 * `{ field: "msg" }`, `{ field: ["msg"] }` and `[{ field|path, message }]`.
 */
function normalizeFieldErrors(raw: unknown): FieldErrors | undefined {
  const result: FieldErrors = {};

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!isRecord(entry) || typeof entry.message !== "string") continue;
      const rawKey = entry.field ?? entry.path;
      const key = Array.isArray(rawKey) ? rawKey.join(".") : rawKey;
      if (typeof key !== "string") continue;
      (result[key] ??= []).push(entry.message);
    }
  } else if (isRecord(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === "string") {
        result[key] = [value];
      } else if (Array.isArray(value)) {
        const messages = value.filter((item): item is string => typeof item === "string");
        if (messages.length > 0) result[key] = messages;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function normalizeErrorBody(body: unknown, status: number, statusText: string): ApiErrorBody {
  const fallback = statusText || `Request failed with status ${status}`;

  if (typeof body === "string") {
    return { message: body.trim() || fallback };
  }
  if (!isRecord(body)) {
    return { message: fallback };
  }

  const message =
    (typeof body.message === "string" && body.message) ||
    (typeof body.error === "string" && body.error) ||
    (typeof body.detail === "string" && body.detail) ||
    (typeof body.title === "string" && body.title) ||
    fallback;
  const code = typeof body.code === "string" ? body.code : undefined;
  const errors = normalizeFieldErrors(body.errors);

  return { message, code, errors };
}

/* -------------------------------------------------------------------------- */
/* Client types                                                                */
/* -------------------------------------------------------------------------- */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryPrimitive = string | number | boolean | Date | null | undefined;
export type QueryParams = Record<string, QueryPrimitive | readonly QueryPrimitive[]>;

/** Anything with a `parse` method, e.g. a Zod schema. Keeps this file schema-library agnostic. */
export interface ResponseSchema<T> {
  parse: (data: unknown) => T;
}

export interface RequestOptions<T = unknown> extends Omit<RequestInit, "body" | "method"> {
  query?: QueryParams;
  /** Plain values are sent as JSON; FormData, Blob, URLSearchParams and strings are sent as-is. */
  body?: unknown;
  /** Validates and types the response at runtime. Strongly recommended for external APIs. */
  schema?: ResponseSchema<T>;
  timeoutMs?: number;
  /** Don't attach the access token (e.g. login, public endpoints). */
  skipAuth?: boolean;
  /** Override the tenant for this call; `null` sends no tenant header. */
  tenantId?: string | null;
}

export type AuthMode = "bearer" | "cookie";
type MaybePromise<T> = T | Promise<T>;

export interface ApiInterceptor {
  /** Runs before every request. Return a new Request to change it. */
  onRequest?: (request: Request) => MaybePromise<Request | void>;
  /** Runs on every response, success or failure, before the body is read. */
  onResponse?: (response: Response, request: Request) => MaybePromise<Response | void>;
  /** Observes every ApiError, e.g. for logging or error reporting. */
  onError?: (error: ApiError, request: Request) => void;
}

export interface ApiClientConfig {
  baseUrl: string;
  authMode: AuthMode;
  timeoutMs: number;
  tenantHeader: string;
  /** Returns the current access token (bearer mode). */
  getAccessToken?: () => MaybePromise<string | null | undefined>;
  /** Returns the active tenant id, when multi-tenancy is on. */
  getTenantId?: () => string | null | undefined;
  /**
   * Called once when a request gets a 401. Refresh the session and return true to
   * retry the request. Concurrent 401s share one call.
   */
  refreshSession?: () => Promise<boolean>;
  /** Called when a 401 can't be recovered: clear state and redirect to login here. */
  onSessionExpired?: (error: ApiError) => void;
  /** Swap the transport, e.g. for the in-browser mock API or tests. */
  fetch?: typeof fetch;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function serializeQueryValue(value: Exclude<QueryPrimitive, null | undefined>): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values: readonly QueryPrimitive[] = Array.isArray(raw) ? raw : [raw as QueryPrimitive];
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      params.append(key, serializeQueryValue(value));
    }
  }

  const search = params.toString();
  if (!search) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${search}`;
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream
  );
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "TimeoutError";
}

/* -------------------------------------------------------------------------- */
/* Client                                                                      */
/* -------------------------------------------------------------------------- */

export interface ApiClient {
  request<T>(method: HttpMethod, path: string, options?: RequestOptions<T>): Promise<T>;
  get<T>(path: string, options?: RequestOptions<T>): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions<T>): Promise<T>;
  /** Update settings at runtime, e.g. when the auth feature registers its token getter. */
  configure(patch: Partial<ApiClientConfig>): void;
  /** Register interceptors. Returns a function that removes them. */
  use(interceptor: ApiInterceptor): () => void;
  readonly config: Readonly<ApiClientConfig>;
}

export function createApiClient(initialConfig: ApiClientConfig): ApiClient {
  let config: ApiClientConfig = { ...initialConfig };
  const interceptors = new Set<ApiInterceptor>();
  let refreshInFlight: Promise<boolean> | null = null;

  function refreshOnce(): Promise<boolean> {
    const refresh = config.refreshSession;
    if (!refresh) return Promise.resolve(false);
    refreshInFlight ??= refresh()
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
    return refreshInFlight;
  }

  async function buildRequest(
    method: HttpMethod,
    path: string,
    options: RequestOptions<unknown>,
  ): Promise<Request> {
    const {
      query,
      body,
      schema: _schema,
      timeoutMs = config.timeoutMs,
      skipAuth = false,
      tenantId,
      headers: initHeaders,
      signal,
      ...init
    } = options;

    const headers = new Headers(initHeaders);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (isRawBody(body)) {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      }
    }

    if (!skipAuth && config.authMode === "bearer" && !headers.has("Authorization")) {
      const token = await config.getAccessToken?.();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    const resolvedTenant = tenantId === undefined ? config.getTenantId?.() : tenantId;
    if (resolvedTenant && !headers.has(config.tenantHeader)) {
      headers.set(config.tenantHeader, resolvedTenant);
    }

    const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;
    const signals = [signal, timeoutSignal].filter((s): s is AbortSignal => s != null);

    let request = new Request(buildUrl(config.baseUrl, path, query), {
      ...init,
      method,
      headers,
      body: requestBody,
      credentials: init.credentials ?? (config.authMode === "cookie" ? "include" : "same-origin"),
      signal: signals.length > 0 ? AbortSignal.any(signals) : undefined,
    });

    for (const interceptor of interceptors) {
      const next = await interceptor.onRequest?.(request);
      if (next) request = next;
    }
    return request;
  }

  function reportError(error: ApiError, request: Request): ApiError {
    for (const interceptor of interceptors) interceptor.onError?.(error, request);
    return error;
  }

  async function execute<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions<T>,
    isRetry: boolean,
  ): Promise<T> {
    const request = await buildRequest(method, path, options);
    const transport = config.fetch ?? globalThis.fetch.bind(globalThis);

    let response: Response;
    try {
      response = await transport(request);
    } catch (error) {
      // Cancellation (React Query unmount, user abort) must propagate untouched.
      const timedOut = isTimeoutError(error) || isTimeoutError(request.signal.reason);
      if (!timedOut && (request.signal.aborted || isAbortError(error))) throw error;
      throw reportError(
        new ApiError({
          status: 0,
          code: timedOut ? API_ERROR_CODES.TIMEOUT : API_ERROR_CODES.NETWORK_ERROR,
          message: timedOut
            ? "The server took too long to respond."
            : "Unable to reach the server. Check your connection.",
          cause: error,
        }),
        request,
      );
    }

    for (const interceptor of interceptors) {
      const next = await interceptor.onResponse?.(response, request);
      if (next) response = next;
    }

    if (response.status === 401 && !options.skipAuth && !isRetry) {
      const refreshed = await refreshOnce();
      if (refreshed) return execute(method, path, options, true);
    }

    const body = await readBody(response);

    if (!response.ok) {
      const normalized = normalizeErrorBody(body, response.status, response.statusText);
      const error = reportError(
        new ApiError({
          status: response.status,
          message: normalized.message,
          code: normalized.code,
          fieldErrors: normalized.errors,
          details: body,
        }),
        request,
      );
      if (error.isUnauthorized && !options.skipAuth) config.onSessionExpired?.(error);
      throw error;
    }

    if (!options.schema) {
      // Without a schema the caller asserts the shape; pass `schema` to verify it.
      return body as T;
    }

    try {
      return options.schema.parse(body);
    } catch (error) {
      throw reportError(
        new ApiError({
          status: response.status,
          code: API_ERROR_CODES.INVALID_RESPONSE,
          message: "The server returned an unexpected response.",
          details: body,
          cause: error,
        }),
        request,
      );
    }
  }

  const client: ApiClient = {
    request: (method, path, options = {}) => execute(method, path, options, false),
    get: (path, options) => client.request("GET", path, options),
    post: (path, body, options) => client.request("POST", path, { ...options, body }),
    put: (path, body, options) => client.request("PUT", path, { ...options, body }),
    patch: (path, body, options) => client.request("PATCH", path, { ...options, body }),
    delete: (path, options) => client.request("DELETE", path, options),
    configure(patch) {
      config = { ...config, ...patch };
    },
    use(interceptor) {
      interceptors.add(interceptor);
      return () => {
        interceptors.delete(interceptor);
      };
    },
    get config() {
      return config;
    },
  };

  return client;
}

/**
 * The app-wide client. Auth and tenant features plug in through `apiClient.configure`
 * (token getter, refresh, session-expired redirect) instead of this file importing them.
 */
export const apiClient = createApiClient({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  authMode: env.NEXT_PUBLIC_AUTH_MODE,
  timeoutMs: 30_000,
  tenantHeader: "X-Tenant-ID",
  getTenantId: env.NEXT_PUBLIC_MULTI_TENANT
    ? () => env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? null
    : undefined,
});
