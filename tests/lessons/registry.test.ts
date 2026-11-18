import { describe, expect, test } from "vitest";
import { catalog } from "~/lessons/catalog";
import { getLesson, lessonsByLevel, neighbors } from "~/lessons/registry";

describe("catalog", () => {
  test("has 21 lessons numbered 1..21 with no gaps", () => {
    expect(catalog).toHaveLength(21);
    expect(catalog.map((l) => l.number)).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
  });

  test("slugs are unique kebab-case", () => {
    const slugs = catalog.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(21);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test("7 lessons per level, in order", () => {
    catalog.forEach((l) => {
      const expected = l.number <= 7 ? "beginner" : l.number <= 14 ? "intermediate" : "advanced";
      expect(l.level).toBe(expected);
    });
    const byLevel = lessonsByLevel();
    expect(byLevel.beginner).toHaveLength(7);
    expect(byLevel.intermediate).toHaveLength(7);
    expect(byLevel.advanced).toHaveLength(7);
  });

  test("titles match the spec", () => {
    const t = (n: number) => catalog[n - 1].title;
    expect(t(1)).toBe("What is software design?");
    expect(t(4)).toBe("OOP in depth: abstraction, inheritance and polymorphism");
    expect(t(21)).toBe("Capstone: redesign a messy codebase step by step");
  });

  test("summaries are at most 160 characters", () => {
    for (const l of catalog) expect(l.summary.length).toBeLessThanOrEqual(160);
  });
});

describe("registry", () => {
  test("getLesson finds by slug and returns undefined for unknown", () => {
    expect(getLesson(catalog[5].slug)?.number).toBe(6);
    expect(getLesson("nope")).toBeUndefined();
  });

  test("neighbors cross level boundaries and stop at the ends", () => {
    expect(neighbors(catalog[6].slug).next?.number).toBe(8);
    expect(neighbors(catalog[0].slug).prev).toBeUndefined();
    expect(neighbors(catalog[20].slug).next).toBeUndefined();
  });
});
