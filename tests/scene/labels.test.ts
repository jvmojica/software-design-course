import { expect, test } from "vitest";
import { labelItems } from "~/scene/labels";
import type { SceneModel } from "~/scene/model";

const m: SceneModel = {
  nodes: [
    { id: "a", label: "A", position: [0, 1, 0], size: [1, 0.4, 1], tone: "primary" },
    { id: "b", label: "B", position: [2, 1, 0], size: [1, 0.4, 1], tone: "primary", emphasis: "highlight" },
    { id: "gone", label: "Gone", position: [4, 0, 0], tone: "neutral", opacity: 0 },
    { id: "d", label: "Dim", position: [6, 0, 0], tone: "neutral", emphasis: "dim" },
  ],
  edges: [],
  layers: [{ id: "l", label: "Layer", y: 0, tone: "neutral", center: [0, 0], extent: [4, 2] }],
  messages: [{ id: "m", from: "a", to: "b", label: "call" }, { id: "quiet", from: "a", to: "b" }],
};

test("node labels sit just above their block, raised further when highlighted", () => {
  const items = labelItems(m);
  expect(items.find((i) => i.id === "a")?.anchor).toEqual([0, 1.5, 0]);
  expect(items.find((i) => i.id === "b")?.anchor[1]).toBeCloseTo(1.75);
});

test("invisible nodes have no label and dim nodes have a faint one", () => {
  const items = labelItems(m);
  expect(items.find((i) => i.id === "gone")).toBeUndefined();
  expect(items.find((i) => i.id === "d")?.opacity).toBeCloseTo(0.35);
});

test("layers and labelled messages get labels; unlabelled messages don't", () => {
  const ids = labelItems(m).map((i) => i.id);
  expect(ids).toContain("l");
  expect(ids).toContain("m");
  expect(ids).not.toContain("quiet");
});
