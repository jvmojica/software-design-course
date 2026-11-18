type Props = { index: number; count: number; go(i: number): void; next(): void; prev(): void };

export function StepControls({ index, count, go, next, prev }: Props) {
  return (
    <nav className="step-controls" aria-label="Lesson steps">
      <button type="button" className="btn" onClick={prev} disabled={index === 0} aria-label="Previous">
        <span aria-hidden="true">◀</span> Prev
      </button>
      <ol className="step-dots">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              className="dot"
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => go(i)}
            />
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-primary" onClick={next} disabled={index === count - 1} aria-label="Next">
        Next <span aria-hidden="true">▶</span>
      </button>
    </nav>
  );
}
