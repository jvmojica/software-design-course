import type { RenderedStep } from "./types";

/** Every step's text in the page HTML — for search engines, screen readers and readers who prefer text. */
export function FullLessonText({ steps }: { steps: RenderedStep[] }) {
  return (
    <details className="full-lesson">
      <summary>
        <h2>Read the full lesson</h2>
      </summary>
      {steps.map((s, i) => (
        <section key={i} id={`text-step-${i + 1}`}>
          <h3>
            {i + 1}. {s.title}
          </h3>
          <div className="prose" dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
          {s.codeHtml && <div className="code" dangerouslySetInnerHTML={{ __html: s.codeHtml }} />}
        </section>
      ))}
    </details>
  );
}
