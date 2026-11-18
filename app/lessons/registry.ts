import { catalog } from "./catalog";
import type { CatalogEntry, Level } from "./types";

/** Lesson metadata (safe for the browser). For a lesson's steps, use content.server.ts. */
export function getLesson(slug: string): CatalogEntry | undefined {
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
