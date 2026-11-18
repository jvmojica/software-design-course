import { useEffect, useRef, useState } from "react";
import type { SceneModel } from "./model";
import { interpolateModel } from "./tween";

const DURATION_MS = 600;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Animates from the currently shown model to `target` over 600 ms (instant with reduced motion). */
export function useTweenedModel(target: SceneModel): SceneModel {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const set = (m: SceneModel) => { shownRef.current = m; setShown(m); };
    if (prefersReducedMotion()) { set(target); return; }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION_MS, 1);
      set(interpolateModel(from, target, easeInOut(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

export { prefersReducedMotion };
