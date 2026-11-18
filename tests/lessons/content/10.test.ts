import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { composition } from "~/scene/layouts/composition";

const lesson = getLessonWithContent("composition-over-inheritance") as Lesson;
if (!lesson) throw new Error("lesson 10 must be published");

const phases = lesson.steps.map((s) => s.sceneState.phase as string);

test("lesson 10 is valid with 6–8 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("composition");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(6);
  expect(lesson.steps.length).toBeLessThanOrEqual(8);
});

test("inheritance phase: solid 'extends' edges form a tree (one parent each)", () => {
  const m = composition({ phase: "duck" });
  const ext = m.edges.filter((e) => e.id.startsWith("ext:") && e.style !== "dashed");
  expect(ext.length).toBeGreaterThan(0);
  const parents = new Map<string, number>();
  for (const e of ext) parents.set(e.from, (parents.get(e.from) ?? 0) + 1);
  for (const [child, count] of parents) expect(count, child).toBe(1);
});

test("the duck can't fit the tree: it wants two parents, shown as dashed alerts", () => {
  const m = composition({ phase: "duck" });
  const wants = m.edges.filter((e) => e.from === "duck" && e.style === "dashed");
  expect(wants.map((e) => e.to).sort()).toEqual(["bird", "fish"]);
  expect(m.nodes.find((n) => n.id === "duck")?.emphasis).toBe("alert");
});

test("composition phase: no tree edges, and the duck has both flying and swimming", () => {
  const m = composition({ phase: "compose" });
  expect(m.edges.some((e) => e.id.startsWith("ext:"))).toBe(false);
  const duckHas = m.edges.filter((e) => e.from === "duck").map((e) => e.to);
  expect(duckHas).toContain("canFly");
  expect(duckHas).toContain("canSwim");
});

test("the lesson walks from inheritance to composition", () => {
  expect(phases.indexOf("duck")).toBeGreaterThanOrEqual(0);
  expect(phases.indexOf("compose")).toBeGreaterThan(phases.indexOf("duck"));
});
