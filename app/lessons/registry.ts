import { catalog } from "./catalog";
import type { CatalogEntry, Lesson, Level } from "./types";

export function isPublished(x: Lesson | CatalogEntry): x is Lesson {
  return x.status === "published" && "steps" in x;
}

export function getLesson(slug: string): Lesson | CatalogEntry | undefined {
  return catalog.find((l) => l.slug === slug);
}

export function lessonsByLevel(): Record<Level, CatalogEntry[]> {
  const out: Record<Level, CatalogEntry[]> = { beginner: [], intermediate: [], advanced: [] };
  for (const l of catalog) out[l.level].push(l);
  return out;
}

export function neighbors(slug: string): { prev?: CatalogEntry; next?: CatalogEntry } {
  const i = catalog.findIndex((l) => l.slug === slug);
  if (i < 0) return {};
  return { prev: catalog[i - 1], next: catalog[i + 1] };
}

export function publishedLessons(): Lesson[] {
  return catalog.filter(isPublished);
}
