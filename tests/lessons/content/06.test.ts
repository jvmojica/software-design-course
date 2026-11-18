import { expect, test } from "vitest";
import { getLesson, isPublished } from "~/lessons/registry";
import { validateLesson } from "~/lessons/validate";
import { couplingCohesion } from "~/scene/layouts/coupling-cohesion";
import type { SceneModel } from "~/scene/model";

const lesson = getLesson("coupling-and-cohesion")!;
if (!isPublished(lesson)) throw new Error("lesson 6 must be published");

/** Which slab (module) a node sits on, judged from the geometry the learner sees. */
function moduleOf(m: SceneModel, nodeId: string): string | undefined {
  const n = m.nodes.find((x) => x.id === nodeId)!;
  const [x, , z] = n.position;
  return m.layers?.find((l) => {
    const [cx, cz] = l.center!;
    const [w, d] = l.extent!;
    return Math.abs(x - cx) <= w / 2 && Math.abs(z - cz) <= d / 2;
  })?.id;
}

const crossEdges = (m: SceneModel) => m.edges.filter((e) => moduleOf(m, e.from) !== moduleOf(m, e.to)).length;
const first = couplingCohesion(lesson.steps[0].sceneState);
const last = couplingCohesion(lesson.steps[lesson.steps.length - 1].sceneState);

test("lesson 6 is valid with 6–8 steps", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("coupling-cohesion");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(6);
  expect(lesson.steps.length).toBeLessThanOrEqual(8);
});

test("regrouping reduces the number of calls that cross module boundaries", () => {
  expect(crossEdges(first)).toBeGreaterThan(crossEdges(last));
  expect(crossEdges(last)).toBe(2);
});

test("in the final step every function sits inside a module", () => {
  for (const n of last.nodes) expect(moduleOf(last, n.id), n.id).toBeDefined();
});

test("in the final step each module holds one related group", () => {
  expect(new Set(["createUser", "hashPw", "checkEmail"].map((id) => moduleOf(last, id))).size).toBe(1);
  expect(new Set(["placeOrder", "total", "discount"].map((id) => moduleOf(last, id))).size).toBe(1);
  expect(new Set(["send", "template", "queue"].map((id) => moduleOf(last, id))).size).toBe(1);
});
