import { useCallback, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

/** Fullscreen state of the document, with a toggle. Useful for kiosk terminals. */
export function useFullscreen(): {
  isFullscreen: boolean;
  isSupported: boolean;
  toggle: () => Promise<void>;
} {
  const isFullscreen = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  );
  const isSupported = useSyncExternalStore(
    subscribe,
    () => document.fullscreenEnabled,
    () => false,
  );

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Denied by the browser or a permissions policy; the UI simply stays as is.
    }
  }, []);

  return { isFullscreen, isSupported, toggle };
}
