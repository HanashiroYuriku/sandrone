import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Returns `false` during prerender and the first
 * hydration pass, then the real value. Avoids hydration mismatches.
 *
 *   const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
