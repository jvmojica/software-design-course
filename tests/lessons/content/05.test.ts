import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { separationOfConcerns as soc } from "~/scene/layouts/separation-of-concerns";
import type { SceneModel } from "~/scene/model";

const lesson = getLessonWithContent("separation-of-concerns") as Lesson;
if (!lesson) throw new Error("lesson 5 must be published");

const CONCERNS = ["c-ui", "c-rules", "c-db", "c-mail"];

/** Which slab a node sits on, judged from the geometry. */
function slabOf(m: SceneModel, id: string) {
  const [x, , z] = m.nodes.find((n) => n.id === id)!.position;
  return m.layers?.find((l) => Math.abs(x - l.center![0]) <= l.extent![0] / 2 && Math.abs(z - l.center![1]) <= l.extent![1] / 2)?.id;
}
const pos = (m: SceneModel, id: string) => m.nodes.find((n) => n.id === id)?.position;
const edgesOf = (m: SceneModel, id: string) => m.edges.filter((e) => e.from === id || e.to === id).map((e) => e.id).sort();

test("lesson 5 is valid with 6–8 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("separation-of-concerns");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(6);
  expect(lesson.steps.length).toBeLessThanOrEqual(8);
});

test("mixed: every concern lives in one file and they're all tangled together", () => {
  const m = soc({ phase: "mixed" });
  expect(new Set(CONCERNS.map((id) => slabOf(m, id))).size).toBe(1);
  expect(m.edges.length).toBeGreaterThanOrEqual(5);
});

test("separate: each concern has its own place, and the UI never talks to storage directly", () => {
  const m = soc({ phase: "separate" });
  const slabs = CONCERNS.map((id) => slabOf(m, id));
  expect(slabs.every(Boolean)).toBe(true);
  expect(new Set(slabs).size).toBe(4);
  expect(m.edges.some((e) => e.from === "c-ui" && e.to === "c-db")).toBe(false);
  expect(m.edges.some((e) => e.from === "c-ui" && e.to === "c-rules")).toBe(true);
});

test("change-ui: a new mobile UI reuses the rules, which don't move or change", () => {
  const before = soc({ phase: "separate" });
  const after = soc({ phase: "change-ui" });
  expect(after.edges.some((e) => e.from === "c-mobile" && e.to === "c-rules")).toBe(true);
  expect(pos(after, "c-rules")).toEqual(pos(before, "c-rules"));
  expect(after.nodes.find((n) => n.id === "c-rules")?.emphasis ?? "normal").toBe("normal");
});

test("change-db: swapping the database only changes the storage block", () => {
  const before = soc({ phase: "separate" });
  const after = soc({ phase: "change-db" });
  const label = (m: SceneModel, id: string) => m.nodes.find((n) => n.id === id)?.label;
  expect(label(after, "c-db")).not.toBe(label(before, "c-db"));
  for (const id of ["c-ui", "c-rules", "c-mail"]) expect(label(after, id), id).toBe(label(before, id));
  expect(edgesOf(after, "c-rules")).toEqual(edgesOf(before, "c-rules"));
});

test("test-rules: the rules can be tested alone, with everything else set aside", () => {
  const m = soc({ phase: "test-rules" });
  expect(m.messages?.some((msg) => msg.from === "test" && msg.to === "c-rules")).toBe(true);
  for (const id of ["c-ui", "c-db", "c-mail"]) expect(m.nodes.find((n) => n.id === id)?.emphasis, id).toBe("dim");
});
