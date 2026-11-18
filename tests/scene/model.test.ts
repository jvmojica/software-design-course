import { expect, test } from "vitest";
import { type SceneModel, validateSceneModel } from "~/scene/model";

const ok: SceneModel = {
  nodes: [
    { id: "a", label: "A", position: [0, 0, 0], tone: "primary" },
    { id: "b", label: "B", position: [2, 0, 0], tone: "neutral" },
  ],
  edges: [{ id: "a-b", from: "a", to: "b" }],
  layers: [{ id: "l1", label: "Layer", y: -1, tone: "neutral" }],
  messages: [{ id: "m", from: "a", to: "b" }],
};

test("a well-formed model is valid", () => {
  expect(validateSceneModel(ok)).toEqual([]);
});

test("duplicate ids across kinds are reported", () => {
  const m = { ...ok, edges: [{ id: "a", from: "a", to: "b" }] };
  expect(validateSceneModel(m).join()).toMatch(/duplicate id "a"/);
});

test("an edge to a missing node is reported", () => {
  const m = { ...ok, edges: [{ id: "e", from: "a", to: "ghost" }] };
  expect(validateSceneModel(m).join()).toMatch(/ghost/);
});

test("a message from a missing node is reported", () => {
  const m = { ...ok, messages: [{ id: "m", from: "nobody", to: "b" }] };
  expect(validateSceneModel(m).join()).toMatch(/nobody/);
});

test("a non-finite position is reported", () => {
  const m = { ...ok, nodes: [...ok.nodes, { id: "c", label: "C", position: [NaN, 0, 0] as [number, number, number], tone: "neutral" as const }] };
  expect(validateSceneModel(m).join()).toMatch(/position/);
});
