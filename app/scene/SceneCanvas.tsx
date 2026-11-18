import { Component, Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SceneId } from "~/lessons/types";
import { sceneLayouts } from "./layouts";
import { isWebGLAvailable } from "./webgl";

// The Three.js code lives in its own chunk and is only requested in the browser, after hydration.
const SceneRenderer = lazy(() => import("./SceneRenderer"));

export const SCENE_FALLBACK =
  "The 3D diagram can't be shown on this device — the lesson text below covers everything.";

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p className="scene-fallback">{SCENE_FALLBACK}</p> : this.props.children;
  }
}

type Props = { scene: SceneId; sceneState: Record<string, unknown>; label: string };

export function SceneCanvas({ scene, sceneState, label }: Props) {
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  useEffect(() => {
    // Wait until the browser is idle so the 3D code never competes with the page's first paint and input.
    const start = () => setMode(isWebGLAvailable() ? "webgl" : "fallback");
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 50);
    return () => clearTimeout(id);
  }, []);
  const model = useMemo(() => sceneLayouts[scene](sceneState), [scene, sceneState]);

  return (
    <div className="scene" role="img" aria-label={label}>
      {mode === "fallback" && <p className="scene-fallback">{SCENE_FALLBACK}</p>}
      {mode === "webgl" && (
        <SceneErrorBoundary>
          <Suspense fallback={<div className="scene-loading" aria-hidden="true" />}>
            <SceneRenderer model={model} />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
