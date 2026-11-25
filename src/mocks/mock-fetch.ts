import type { HttpMethod } from "@/lib/api-client";

/**
 * A tiny in-browser backend: a `fetch` replacement that routes requests to handlers.
 * Plug it into the API client with `apiClient.configure({ fetch })`, so the whole
 * request pipeline (auth headers, error normalization, schemas) runs for real.
 */

export interface MockContext {
  request: Request;
  url: URL;
  /** Values of `:param` segments in the handler path. */
  params: Record<string, string>;
  query: URLSearchParams;
  /** Parsed JSON body, or `undefined` when the body is empty or not JSON. */
  body: () => Promise<unknown>;
}

export interface MockHandler {
  method: HttpMethod;
  /** Path relative to the API base URL, e.g. "/items/:id". */
  path: string;
  handle: (context: MockContext) => Response | Promise<Response>;
}

export function mockJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mockError(
  status: number,
  message: string,
  extra: { code?: string; errors?: Record<string, string[]> } = {},
): Response {
  return mockJson({ message, ...extra }, status);
}

export function mockNoContent(): Response {
  return new Response(null, { status: 204 });
}

interface CompiledHandler extends MockHandler {
  pattern: RegExp;
  paramNames: string[];
}

function compile(handler: MockHandler): CompiledHandler {
  const paramNames: string[] = [];
  const source = handler.path
    .replace(/\/+$/, "")
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { ...handler, pattern: new RegExp(`^${source}/?$`), paramNames };
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

export interface MockFetchOptions {
  /** The API base URL; its path prefix is stripped before matching. */
  baseUrl: string;
  handlers: readonly MockHandler[];
  /** Simulated network latency range in ms. */
  latency?: readonly [min: number, max: number];
}

export function createMockFetch({
  baseUrl,
  handlers,
  latency = [150, 450],
}: MockFetchOptions): typeof fetch {
  const compiled = handlers.map(compile);
  const basePath = new URL(baseUrl, "http://mock.local").pathname.replace(/\/+$/, "");

  return async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url, window.location.origin);
    const path = url.pathname.startsWith(basePath)
      ? url.pathname.slice(basePath.length) || "/"
      : url.pathname;

    const [min, max] = latency;
    await wait(min + Math.random() * Math.max(0, max - min), request.signal);

    for (const handler of compiled) {
      if (handler.method !== request.method) continue;
      const match = handler.pattern.exec(path);
      if (!match) continue;

      const params: Record<string, string> = {};
      handler.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1] ?? "");
      });

      try {
        return await handler.handle({
          request,
          url,
          params,
          query: url.searchParams,
          body: async () => {
            const text = await request.clone().text();
            if (!text) return undefined;
            try {
              return JSON.parse(text) as unknown;
            } catch {
              return undefined;
            }
          },
        });
      } catch (error) {
        console.error(`[mock api] ${request.method} ${path} failed`, error);
        return mockError(500, "Mock handler crashed. See the console for details.");
      }
    }

    return mockError(404, `No mock handler for ${request.method} ${path}`, { code: "NOT_FOUND" });
  };
}
