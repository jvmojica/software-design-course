import { Link } from "react-router";
import type { CatalogEntry } from "~/lessons/types";

export function LessonCard({ entry }: { entry: CatalogEntry }) {
  const soon = entry.status === "coming-soon";
  return (
    <li className={`lesson-card${soon ? " is-soon" : ""}`}>
      <Link to={`/lessons/${entry.slug}`}>
        <span className="lesson-num">{String(entry.number).padStart(2, "0")}</span>
        <span className="lesson-body">
          <span className="lesson-title">{entry.title}</span>
          <span className="lesson-summary">{entry.summary}</span>
        </span>
        {soon && <span className="badge">Coming soon</span>}
      </Link>
    </li>
  );
}
