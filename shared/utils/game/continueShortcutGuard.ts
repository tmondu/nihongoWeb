const DEFAULT_SUPPRESSION_MS = 500;

declare global {
  interface Window {
    __pthamssContinueShortcutSuppressedUntil?: number;
    __kanaDojoContinueShortcutSuppressedUntil?: number;
  }
}

export const suppressContinueKeyboardShortcuts = (
  durationMs: number = DEFAULT_SUPPRESSION_MS,
): void => {
  if (typeof window === 'undefined') return;
  const now = performance.now();
  window.__pthamssContinueShortcutSuppressedUntil = now + durationMs;
};

export const shouldSuppressContinueKeyboardShortcut = (): boolean => {
  if (typeof window === 'undefined') return false;
  const suppressedUntil =
    window.__pthamssContinueShortcutSuppressedUntil ??
    window.__kanaDojoContinueShortcutSuppressedUntil ??
    0;
  return performance.now() < suppressedUntil;
};
