import { useCallback, useSyncExternalStore } from "react";

/**
 * Current time as epoch milliseconds, rounded down to `intervalMs` and refreshed on that
 * interval. Returns `null` during prerender and hydration, so clocks never mismatch.
 */
export function useNow(intervalMs = 30_000): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const timer = window.setInterval(onChange, intervalMs);
      return () => window.clearInterval(timer);
    },
    [intervalMs],
  );

  return useSyncExternalStore(
    subscribe,
    // Rounded so consecutive snapshots are equal until the next tick.
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}
