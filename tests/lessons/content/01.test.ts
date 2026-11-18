import { expect, test } from "vitest";
import { getLesson, isPublished } from "~/lessons/registry";
import { validateLesson } from "~/lessons/validate";
import { whatIsDesign } from "~/scene/layouts/what-is-design";
import { validateSceneModel } from "~/scene/model";

const lesson = getLesson("what-is-software-design")!;

test("lesson 1 is published, valid and has 7–9 steps", () => {
  expect(isPublished(lesson)).toBe(true);
  if (!isPublished(lesson)) return;
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("what-is-design");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
});

test("ripple: the tangled side lights up red, the designed side changes one module", () => {
  const m = whatIsDesign({ phase: "ripple" });
  const left = m.nodes.filter((n) => n.id.startsWith("a-"));
  const right = m.nodes.filter((n) => n.id.startsWith("b-"));
  expect(left.filter((n) => n.emphasis === "alert").length).toBeGreaterThanOrEqual(4);
  expect(right.filter((n) => n.emphasis === "highlight")).toHaveLength(1);
  expect(right.some((n) => n.emphasis === "alert")).toBe(false);
});

test("intro: nothing is in alert", () => {
  expect(whatIsDesign({ phase: "intro" }).nodes.some((n) => n.emphasis === "alert")).toBe(false);
});

test("the home-page hero phase is a valid scene", () => {
  expect(validateSceneModel(whatIsDesign({ phase: "hero" }))).toEqual([]);
});

test("an unknown phase falls back to a valid scene instead of crashing", () => {
  expect(validateSceneModel(whatIsDesign({ phase: "nonsense" }))).toEqual([]);
});
