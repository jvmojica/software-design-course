import { lessonsByLevel } from "~/lessons/registry";
import { LEVEL_LABEL, LEVELS } from "~/lessons/types";
import { LessonCard } from "./LessonCard";

const LEVEL_BLURB = {
  beginner: "Thinking in pieces",
  intermediate: "Principles",
  advanced: "Patterns and architecture",
} as const;

export function CourseMap() {
  const byLevel = lessonsByLevel();
  return (
    <div className="course-map">
      {LEVELS.map((level) => (
        <section key={level} className={`level level-${level}`} aria-labelledby={`level-${level}`}>
          <h2 id={`level-${level}`}>{LEVEL_LABEL[level]}</h2>
          <p className="level-blurb">{LEVEL_BLURB[level]}</p>
          <ol className="lesson-list">
            {byLevel[level].map((e) => <LessonCard key={e.slug} entry={e} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}
