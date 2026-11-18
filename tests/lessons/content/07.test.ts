import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { keepSimple } from "~/scene/layouts/keep-simple";

const lesson = getLessonWithContent("dry-kiss-yagni") as Lesson;
if (!lesson) throw new Error("lesson 7 must be published");

const ids = (phase: string, prefix: string) => keepSimple({ phase }).nodes.filter((n) => n.id.startsWith(prefix));

test("lesson 7 is valid with 7–9 steps covering all three rules", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("keep-simple");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
  const phases = lesson.steps.map((s) => String(s.sceneState.phase));
  for (const p of ["dry", "kiss", "yagni"]) expect(phases.some((ph) => ph.startsWith(p)), p).toBe(true);
});

test("DRY, copies: each caller carries its own copy of the tax rule", () => {
  const m = keepSimple({ phase: "dry-copies" });
  const copies = ids("dry-copies", "copy-");
  expect(copies).toHaveLength(3);
  for (const c of copies) expect(m.edges.filter((e) => e.to === c.id)).toHaveLength(1);
});

test("DRY, change: updating the rule misses exactly one copy", () => {
  const copies = ids("dry-change", "copy-");
  expect(copies.filter((c) => c.emphasis === "alert")).toHaveLength(1);
  expect(copies.filter((c) => c.emphasis === "highlight")).toHaveLength(2);
});

test("DRY, fixed: one shared rule, used by all three callers", () => {
  const m = keepSimple({ phase: "dry-fixed" });
  expect(ids("dry-fixed", "copy-")).toHaveLength(0);
  expect(m.edges.filter((e) => e.to === "tax").map((e) => e.from).sort()).toEqual(["cart", "checkout", "invoice"]);
});

test("KISS: the clever version needs many parts, the simple one needs one", () => {
  expect(keepSimple({ phase: "kiss-clever" }).nodes.length).toBeGreaterThanOrEqual(4);
  expect(keepSimple({ phase: "kiss-simple" }).nodes).toHaveLength(1);
});

test("YAGNI: speculative features appear dimmed and disappear when you build only what's needed", () => {
  const maybes = ids("yagni-future", "maybe-");
  expect(maybes.length).toBeGreaterThanOrEqual(3);
  for (const n of maybes) expect(n.emphasis, n.id).toBe("dim");
  expect(ids("yagni-now", "maybe-")).toHaveLength(0);
  expect(keepSimple({ phase: "yagni-now" }).nodes.some((n) => n.id === "csv")).toBe(true);
});

test("summary names all three rules", () => {
  const labels = keepSimple({ phase: "summary" }).nodes.map((n) => n.label);
  for (const r of ["DRY", "KISS", "YAGNI"]) expect(labels.some((l) => l.includes(r)), r).toBe(true);
});
