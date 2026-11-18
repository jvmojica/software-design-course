import { expect, test } from "vitest";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";

const valid: Lesson = {
  number: 1, slug: "a", title: "A", level: "beginner", summary: "s", status: "published",
  scene: "placeholder",
  steps: [{ title: "One", body: "text", sceneState: {} }],
};

test("a minimal valid lesson has no errors", () => {
  expect(validateLesson(valid)).toEqual([]);
});

test("zero steps is an error", () => {
  expect(validateLesson({ ...valid, steps: [] })).not.toEqual([]);
});

test("an empty step title is an error", () => {
  expect(validateLesson({ ...valid, steps: [{ title: " ", body: "x", sceneState: {} }] })).not.toEqual([]);
});

test("a summary over 160 characters is an error", () => {
  expect(validateLesson({ ...valid, summary: "x".repeat(161) })).not.toEqual([]);
});
