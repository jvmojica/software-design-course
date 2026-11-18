import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { oopInDepth } from "~/scene/layouts/oop-in-depth";

const lesson = getLessonWithContent("oop-in-depth") as Lesson;
if (!lesson) throw new Error("lesson 4 must be published");

const KIDS = ["circle", "square", "triangle"];
const appEdges = (phase: string) => oopInDepth({ phase }).edges.filter((e) => e.from === "app").map((e) => e.to).sort();

test("lesson 4 is valid with 7–9 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("oop-in-depth");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
});

test("abstraction: the app only touches the simple Shape interface; the hard parts stay hidden", () => {
  const m = oopInDepth({ phase: "abstraction" });
  expect(appEdges("abstraction")).toEqual(["shape"]);
  const hidden = m.nodes.filter((n) => n.id.startsWith("hid-"));
  expect(hidden.length).toBeGreaterThan(0);
  for (const h of hidden) expect(h.emphasis, h.id).toBe("dim");
});

test("inheritance: each shape extends Shape, one parent each", () => {
  const m = oopInDepth({ phase: "inheritance" });
  const ext = m.edges.filter((e) => e.id.startsWith("ext:"));
  expect(ext.map((e) => `${e.from}>${e.to}`).sort()).toEqual(KIDS.map((k) => `${k}>shape`).sort());
});

test("override: each shape shows its own area formula", () => {
  const m = oopInDepth({ phase: "override" });
  const labels = KIDS.map((k) => m.nodes.find((n) => n.id === k)!.label);
  expect(new Set(labels).size).toBe(3);
  for (const l of labels) expect(l).toMatch(/area/);
});

test("polymorphism: one draw() call reaches every concrete shape, each answering its own way", () => {
  const m = oopInDepth({ phase: "polymorphism" });
  const targets = (m.messages ?? []).filter((msg) => msg.from === "app").map((msg) => msg.to).sort();
  expect(targets).toEqual([...KIDS].sort());
});

test("a new shape joins without changing the app's code", () => {
  expect(appEdges("poly-new")).toEqual(appEdges("polymorphism"));
  const m = oopInDepth({ phase: "poly-new" });
  expect((m.messages ?? []).some((msg) => msg.to === "star")).toBe(true);
  expect(m.edges.some((e) => e.id === "ext:star" && e.to === "shape")).toBe(true);
});

test("pillars: the summary shows all four pillars of OOP", () => {
  const labels = oopInDepth({ phase: "pillars" }).nodes.map((n) => n.label.toLowerCase());
  for (const p of ["encapsulation", "abstraction", "inheritance", "polymorphism"]) {
    expect(labels.some((l) => l.includes(p)), p).toBe(true);
  }
});
