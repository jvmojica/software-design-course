import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { functions } from "~/scene/layouts/functions";

const lesson = getLessonWithContent("functions-and-naming") as Lesson;
if (!lesson) throw new Error("lesson 2 must be published");

const FN_IDS = ["f-validate", "f-total", "f-charge", "f-receipt"];
const label = (phase: string, id: string) => functions({ phase }).nodes.find((n) => n.id === id)?.label;

test("lesson 2 is valid with 7–9 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("functions");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
});

test("monolith: the whole job is one big function", () => {
  const m = functions({ phase: "monolith" });
  expect(m.nodes.map((n) => n.id)).toEqual(["processOrder"]);
});

test("extract: the top-level function calls each of the four small functions", () => {
  const m = functions({ phase: "extract" });
  const callees = m.edges.filter((e) => e.from === "processOrder").map((e) => e.to).sort();
  expect(callees).toEqual([...FN_IDS].sort());
});

test("naming: every vague name is replaced by a verb-first name", () => {
  for (const id of FN_IDS) {
    const bad = label("extract", id);
    const good = label("names", id);
    expect(good, id).not.toBe(bad);
    expect(good, id).toMatch(/^(validate|calculate|charge|send)[A-Z]\w*\(\)$/);
  }
});

test("reuse: once extracted, calculateTotal gets a second caller", () => {
  const m = functions({ phase: "reuse" });
  const callers = m.edges.filter((e) => e.to === "f-total").map((e) => e.from);
  expect(callers.sort()).toEqual(["processOrder", "showCart"]);
});

test("levels: the story and the details sit on separate layers", () => {
  const m = functions({ phase: "levels" });
  const story = m.nodes.find((n) => n.id === "processOrder")!;
  for (const id of FN_IDS) expect(m.nodes.find((n) => n.id === id)!.position[1]).toBeLessThan(story.position[1]);
  expect(m.layers?.map((l) => l.id).sort()).toEqual(["layer-details", "layer-story"]);
});
