export const LOGIN_PATH = "/login";

/**
 * Accepts only same-origin relative paths ("/items?page=2"), so a crafted
 * `?next=https://evil.example` link can't turn login into an open redirect.
 */
export function getSafeRedirect(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return undefined;
  }
  return value;
}

/** "/login?next=<current path>" for the given path, or for the current location. */
export function buildLoginHref(next?: string): string {
  const target =
    next ??
    (typeof window === "undefined" ? undefined : window.location.pathname + window.location.search);
  const safe = getSafeRedirect(target);
  // Static export uses trailing slashes ("/login/"), so compare without them.
  const pathname = safe?.split("?")[0]?.replace(/\/+$/, "");
  if (!safe || pathname === LOGIN_PATH) return LOGIN_PATH;
  return `${LOGIN_PATH}?next=${encodeURIComponent(safe)}`;
}

/** The `next` param of the current URL, if it is safe to follow. */
export function readNextParam(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return getSafeRedirect(new URLSearchParams(window.location.search).get("next"));
}
