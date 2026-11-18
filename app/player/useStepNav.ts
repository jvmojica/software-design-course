import { useCallback, useEffect, useState } from "react";

const clamp = (i: number, count: number) => Math.min(Math.max(i, 0), Math.max(count - 1, 0));

/** Reads `#step-N` (1-based). Anything malformed maps to the first step; out-of-range clamps. */
function indexFromHash(hash: string, count: number): number {
  const m = /^#step-(\d+)$/.exec(hash);
  if (!m) return 0;
  return clamp(Number(m[1]) - 1, count);
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export function useStepNav(count: number) {
  // Always 0 on the first render so pre-rendered HTML and hydration agree; the hash is read after mount.
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const sync = () => setIndex(indexFromHash(location.hash, count));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [count]);

  const go = useCallback(
    (i: number) => {
      const next = clamp(i, count);
      setIndex(next);
      history.replaceState(history.state, "", `#step-${next + 1}`);
    },
    [count],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      // Arrow keys only: PageUp/PageDown stay with the browser so the page (and the full lesson text) still scrolls.
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return { index, go, next, prev };
}
