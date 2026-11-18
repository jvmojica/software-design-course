import type { ReactNode } from "react";
import { StepControls } from "./StepControls";
import { StepPanel } from "./StepPanel";
import type { RenderedStep } from "./types";
import { useStepNav } from "./useStepNav";

type Props = {
  title: string;
  steps: RenderedStep[];
  renderScene(sceneState: Record<string, unknown>, index: number): ReactNode;
};

export function LessonPlayer({ title, steps, renderScene }: Props) {
  const nav = useStepNav(steps.length);
  const step = steps[nav.index];
  return (
    <section className="player" aria-label={`${title} — interactive lesson`}>
      <div className="player-scene">{renderScene(step.sceneState, nav.index)}</div>
      <StepPanel step={step} index={nav.index} count={steps.length} />
      <StepControls {...nav} count={steps.length} />
      <p className="key-hint">Tip: use ← → keys to step through.</p>
    </section>
  );
}
