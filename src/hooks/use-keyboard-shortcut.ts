import { useEffect, useRef, useSyncExternalStore } from "react";

export interface KeyboardShortcut {
  /** `KeyboardEvent.key`, case-insensitive: "k", "Enter", "Escape", "/". */
  key: string;
  /** Cmd on macOS, Ctrl elsewhere. */
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  /** Fire even while the user is typing in an input, textarea or contenteditable. */
  allowInInputs?: boolean;
  preventDefault?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Registers a global shortcut on `window`.
 *
 *   useKeyboardShortcut({ key: "k", mod: true }, () => setOpen((open) => !open));
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: (event: KeyboardEvent) => void,
  { enabled = true, allowInInputs = false, preventDefault = true }: UseKeyboardShortcutOptions = {},
): void {
  // Always call the latest handler without re-subscribing on every render.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const { key, mod = false, shift = false, alt = false } = shortcut;

  useEffect(() => {
    if (!enabled) return;
    const apple = isApplePlatform();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      const modPressed = apple ? event.metaKey : event.ctrlKey;
      if (modPressed !== mod || event.shiftKey !== shift || event.altKey !== alt) return;
      // A mod shortcut is unambiguous, so it may fire while typing (e.g. Cmd+K in a search box).
      if (!allowInInputs && !mod && isTypingTarget(event.target)) return;

      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, mod, shift, alt, enabled, allowInInputs, preventDefault]);
}

const noopSubscribe = () => () => {};

/**
 * True on macOS/iOS. False during prerender and hydration (so shortcut hints render
 * "Ctrl" first and switch to "⌘" after hydration, without a mismatch).
 */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(noopSubscribe, isApplePlatform, () => false);
}

/** Label for shortcut hints: "⌘K" on Apple devices, "Ctrl K" elsewhere. Client-only. */
export function formatShortcut({ key, mod, shift, alt }: KeyboardShortcut): string {
  const apple = isApplePlatform();
  const parts: string[] = [];
  if (mod) parts.push(apple ? "⌘" : "Ctrl");
  if (shift) parts.push(apple ? "⇧" : "Shift");
  if (alt) parts.push(apple ? "⌥" : "Alt");
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join(apple ? "" : " ");
}
