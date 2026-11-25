import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "sandrone:persisted-state";

function read<T>(key: string, fallback: T, parse: (raw: string) => T | undefined): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * useState backed by localStorage, synced across components and browser tabs.
 *
 * Renders `defaultValue` during prerender and hydration, then switches to the stored
 * value, so server and client HTML always match. Values must be primitives
 * (string/number/boolean) so snapshots compare by value.
 */
export function usePersistedState<T extends string | number | boolean>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const parse = useCallback(
    (raw: string): T | undefined => {
      try {
        const value: unknown = JSON.parse(raw);
        return typeof value === typeof defaultValue ? (value as T) : undefined;
      } catch {
        return undefined;
      }
    },
    [defaultValue],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (event: Event) => {
        if (event instanceof StorageEvent && event.key !== key) return;
        if (event instanceof CustomEvent && event.detail !== key) return;
        onChange();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(CHANGE_EVENT, onStorage);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(CHANGE_EVENT, onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => read(key, defaultValue, parse),
    () => defaultValue,
  );

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage full or blocked (private mode): keep working without persistence.
      }
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
    },
    [key],
  );

  return [value, setValue];
}
