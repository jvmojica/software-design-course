import type { RenderedStep } from "./types";

export function StepPanel({ step, index, count }: { step: RenderedStep; index: number; count: number }) {
  return (
    <div className="step-panel" aria-live="polite">
      <p className="step-count">Step {index + 1} of {count}</p>
      <h2 className="step-title">{step.title}</h2>
      {/* Trusted HTML: generated at build time from lesson files in this repo. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: step.bodyHtml }} />
      {step.codeHtml && <div className="code" dangerouslySetInnerHTML={{ __html: step.codeHtml }} />}
    </div>
  );
}
