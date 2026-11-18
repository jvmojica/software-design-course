import { expect, test } from "vitest";
import { catalog } from "~/lessons/catalog";
import { getLessonWithContent, publishedLessons } from "~/lessons/content.server";
import { scenePhases, sceneLayouts } from "~/scene/layouts";

test("the browser-side catalog carries metadata only, no lesson content", () => {
  for (const entry of catalog) expect("steps" in entry, entry.slug).toBe(false);
});

test("every published catalog entry has content, and only those do", () => {
  for (const entry of catalog) {
    const full = getLessonWithContent(entry.slug);
    if (entry.status === "published") expect(full?.steps.length, entry.slug).toBeGreaterThan(0);
    else expect(full, entry.slug).toBeUndefined();
  }
});

test("every step names a phase its scene actually has (no silent fallback from a typo)", () => {
  for (const lesson of publishedLessons()) {
    const allowed = scenePhases[lesson.scene];
    expect(allowed, lesson.scene).toBeDefined();
    lesson.steps.forEach((s, i) => {
      expect(allowed, `lesson ${lesson.number} step ${i + 1}`).toContain(s.sceneState.phase);
    });
  }
});

test("every scene id has both a layout and a phase list", () => {
  expect(Object.keys(scenePhases).sort()).toEqual(Object.keys(sceneLayouts).sort());
});
