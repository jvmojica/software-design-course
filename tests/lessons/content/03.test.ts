import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { oopBasics } from "~/scene/layouts/oop-basics";

const lesson = getLessonWithContent("oop-basics") as Lesson;
if (!lesson) throw new Error("lesson 3 must be published");

const outsideEdges = (phase: string) =>
  oopBasics({ phase }).edges.filter((e) => e.from.startsWith("out-")).map((e) => `${e.from}>${e.to}`).sort();

test("lesson 3 is valid with 7–9 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("oop-basics");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
});

test("loose: outside code reaches straight into the data", () => {
  const m = oopBasics({ phase: "loose" });
  expect(m.edges.some((e) => e.from.startsWith("out-") && e.to === "d-balance")).toBe(true);
  expect(m.layers ?? []).toHaveLength(0);
});

test("danger: a direct write puts the balance into an invalid state", () => {
  const m = oopBasics({ phase: "danger" });
  expect(m.nodes.find((n) => n.id === "d-balance")?.emphasis).toBe("alert");
});

test("objects: one class, two objects, each with its own data", () => {
  const m = oopBasics({ phase: "objects" });
  const objects = m.nodes.filter((n) => n.id.startsWith("obj-"));
  expect(objects).toHaveLength(2);
  expect(new Set(objects.map((o) => o.label)).size).toBe(2);
  expect(m.edges.filter((e) => e.from === "cls").map((e) => e.to).sort()).toEqual(objects.map((o) => o.id).sort());
});

test("encapsulation: outside code only talks to methods, never to data", () => {
  const m = oopBasics({ phase: "encapsulation" });
  const fromOutside = m.edges.filter((e) => e.from.startsWith("out-"));
  expect(fromOutside.length).toBeGreaterThan(0);
  for (const e of fromOutside) expect(e.to, e.id).toMatch(/^m-/);
  expect(m.layers?.map((l) => l.id)).toEqual(["class-BankAccount"]);
});

test("guard: an invalid withdrawal is stopped by the method and the balance stays valid", () => {
  const m = oopBasics({ phase: "guard" });
  expect(m.messages?.some((msg) => msg.to === "m-withdraw")).toBe(true);
  expect(m.nodes.find((n) => n.id === "d-balance")?.emphasis).not.toBe("alert");
});

test("change-inside: the internals change, the outside connections don't", () => {
  expect(outsideEdges("change-inside")).toEqual(outsideEdges("encapsulation"));
  const before = oopBasics({ phase: "encapsulation" }).nodes.map((n) => n.id);
  const after = oopBasics({ phase: "change-inside" }).nodes.map((n) => n.id);
  expect(after).not.toEqual(before);
});
