import type { SceneLayout } from "../model";

/** A tiny demo scene: two modules on a layer with a dependency and a message. */
export const placeholder: SceneLayout = () => ({
  nodes: [
    { id: "ui", label: "UI", position: [-2, 0.5, 0], tone: "primary" },
    { id: "logic", label: "Logic", position: [0, 0.5, 0], tone: "secondary" },
    { id: "store", label: "Storage", position: [2, 0.5, 0], tone: "accent" },
  ],
  edges: [
    { id: "ui-logic", from: "ui", to: "logic" },
    { id: "logic-store", from: "logic", to: "store", style: "dashed" },
  ],
  layers: [{ id: "app", label: "App", y: 0, tone: "neutral", center: [0, 0], extent: [7, 3] }],
  messages: [{ id: "req", from: "ui", to: "logic" }],
});
