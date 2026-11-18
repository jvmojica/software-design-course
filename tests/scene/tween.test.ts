import { expect, test } from "vitest";
import type { SceneModel } from "~/scene/model";
import { interpolateModel } from "~/scene/tween";

const from: SceneModel = {
  nodes: [
    { id: "a", label: "A", position: [0, 0, 0], tone: "primary" },
    { id: "gone", label: "Gone", position: [5, 0, 0], tone: "neutral" },
  ],
  edges: [],
};
const to: SceneModel = {
  nodes: [
    { id: "a", label: "A", position: [4, 2, 0], tone: "danger", emphasis: "alert" },
    { id: "new", label: "New", position: [1, 0, 1], tone: "accent" },
  ],
  edges: [{ id: "a-new", from: "a", to: "new" }],
};

const node = (m: SceneModel, id: string) => m.nodes.find((n) => n.id === id);

test("t=0 matches the from model", () => {
  const m = interpolateModel(from, to, 0);
  expect(node(m, "a")?.position).toEqual([0, 0, 0]);
  expect(node(m, "gone")?.opacity).toBe(1);
  expect(node(m, "new")?.opacity).toBe(0);
});

test("t=1 equals the to model", () => {
  expect(interpolateModel(from, to, 1)).toEqual(to);
});

test("t=0.5 puts shared nodes at the midpoint", () => {
  expect(node(interpolateModel(from, to, 0.5), "a")?.position).toEqual([2, 1, 0]);
});

test("entering nodes fade in and leaving nodes fade out", () => {
  const m = interpolateModel(from, to, 0.25);
  expect(node(m, "new")?.opacity).toBeCloseTo(0.25);
  expect(node(m, "gone")?.opacity).toBeCloseTo(0.75);
});

test("edges to entering nodes are kept only when both ends exist", () => {
  const m = interpolateModel(from, to, 0.5);
  expect(m.edges.map((e) => e.id)).toEqual(["a-new"]);
});
