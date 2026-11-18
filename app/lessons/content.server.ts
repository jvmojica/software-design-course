import { catalog } from "./catalog";
import { lesson01 } from "./content/01-what-is-software-design";
import { lesson02 } from "./content/02-functions-and-naming";
import { lesson03 } from "./content/03-oop-basics";
import { lesson04 } from "./content/04-oop-in-depth";
import { lesson06 } from "./content/06-coupling-and-cohesion";
import { lesson10 } from "./content/10-composition-over-inheritance";
import { lesson16 } from "./content/16-behavioral-patterns";
import type { Lesson } from "./types";

/** Built lesson content, keyed by lesson number. Build-time only: imported by route loaders and scripts. */
const content: Record<number, Pick<Lesson, "scene" | "steps">> = {
  1: lesson01,
  2: lesson02,
  3: lesson03,
  4: lesson04,
  6: lesson06,
  10: lesson10,
  16: lesson16,
};

/** A published lesson with its steps, or undefined for unknown and coming-soon slugs. */
export function getLessonWithContent(slug: string): Lesson | undefined {
  const entry = catalog.find((l) => l.slug === slug);
  const c = entry && entry.status === "published" ? content[entry.number] : undefined;
  return entry && c ? { ...entry, ...c } : undefined;
}

export function publishedLessons(): Lesson[] {
  return catalog.flatMap((e) => getLessonWithContent(e.slug) ?? []);
}
