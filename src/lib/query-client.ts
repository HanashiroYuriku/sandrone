import { MutationCache, QueryCache, QueryClient, isServer } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, getErrorMessage } from "@/lib/api-client";

/**
 * Typed `meta` for queries and mutations. Set a message and the cache shows the
 * toast, so components don't repeat try/catch + toast boilerplate:
 *
 *   useMutation({ mutationFn, meta: { successMessage: "Item saved", errorMessage: "Could not save item" } })
 */
export interface AppQueryMeta extends Record<string, unknown> {
  /** Toast title when the query fails. Omit to fail silently (e.g. the page shows its own error state). */
  errorMessage?: string;
}

export interface AppMutationMeta extends Record<string, unknown> {
  successMessage?: string;
  errorMessage?: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!ApiError.is(error)) return true;
  // 4xx won't succeed on retry, except 408 (timeout) and 429 (rate limit). A bad
  // response shape won't fix itself either.
  if (error.code === "INVALID_RESPONSE") return false;
  if (error.status >= 400 && error.status < 500) {
    return error.status === 408 || error.status === 429;
  }
  return true;
}

function notifyError(title: string, error: unknown): void {
  // A 401 is handled once by the API client's onSessionExpired, not per query.
  if (ApiError.is(error) && error.isUnauthorized) return;
  toast.error(title, { description: getErrorMessage(error) });
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const title = query.meta?.errorMessage;
        if (title) notifyError(title, error);
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const message = mutation.meta?.successMessage;
        if (message) toast.success(message);
      },
      onError: (error, _variables, _context, mutation) => {
        const title = mutation.meta?.errorMessage;
        if (title) notifyError(title, error);
      },
    }),
    defaultOptions: {
      queries: {
        // Data stays fresh for 30s: avoids refetch storms on every mount/focus.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        // Mutations are not idempotent by default; never retry them automatically.
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server (build-time prerender): a fresh client per render so data never leaks between pages.
 * Browser: one client for the app's lifetime, so React suspending during the first
 * render doesn't throw the cache away.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
