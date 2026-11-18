import { describe, expect, test } from "vitest";
import { publishedLessons } from "~/lessons/content.server";
import { sceneLayouts } from "~/scene/layouts";
import { validateSceneModel } from "~/scene/model";

test("the placeholder layout is valid", () => {
  expect(validateSceneModel(sceneLayouts.placeholder({}))).toEqual([]);
});

describe.each(publishedLessons().map((l) => [l.number, l] as const))("lesson %i scene", (_n, lesson) => {
  test.each(lesson.steps.map((s, i) => [i + 1, s] as const))("step %i is a valid scene model", (_i, step) => {
    expect(validateSceneModel(sceneLayouts[lesson.scene](step.sceneState))).toEqual([]);
  });
});
