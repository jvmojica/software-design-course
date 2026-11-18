import type { Lesson } from "./types";

export function validateLesson(l: Lesson): string[] {
  const errors: string[] = [];
  if (!l.title.trim()) errors.push(`lesson ${l.number}: empty title`);
  if (l.summary.length > 160) errors.push(`lesson ${l.number}: summary longer than 160 chars`);
  if (l.steps.length === 0) errors.push(`lesson ${l.number}: has no steps`);
  l.steps.forEach((s, i) => {
    if (!s.title.trim()) errors.push(`lesson ${l.number} step ${i + 1}: empty title`);
    if (!s.body.trim()) errors.push(`lesson ${l.number} step ${i + 1}: empty body`);
  });
  return errors;
}
