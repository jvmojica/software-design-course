import type { EdgeSpec, Emphasis, LayerSpec, MessageSpec, NodeSpec, SceneLayout } from "../model";
import { iso, isoCenter, pick } from "./helpers";

/**
 * Lesson 1. The same to-do app built two ways:
 *  A (left)  — tangled: every piece reaches into every other piece.
 *  B (right) — designed: UI → rules → storage, stacked as layers.
 * A feature request arrives; in A the change ripples, in B it stays in one module.
 */
export const PHASES = ["intro", "inside", "two-ways", "request", "ripple", "contained", "definition", "ahead", "hero"] as const;
type Phase = (typeof PHASES)[number];

const A_U = -2.9; // tangled version, left of center
const B_U = 3.0; // designed version, right of center

// Tangled pieces: [id, label, u, v] relative to the group's center. Slightly irregular on purpose.
const TANGLED: [string, string, number, number][] = [
  ["a-screen", "Screen", -1.2, -1.0],
  ["a-buttons", "Buttons", 0.25, -1.25],
  ["a-rules", "Rules", 1.35, -0.7],
  ["a-format", "Formatting", -1.35, 0.75],
  ["a-db", "Database", 0.1, 0.55],
  ["a-list", "List", 1.25, 1.2],
];

// Everything talks to everything: the defining feature of the tangled version.
const TANGLED_EDGES: [string, string][] = [
  ["a-screen", "a-db"], ["a-buttons", "a-rules"], ["a-buttons", "a-db"], ["a-rules", "a-format"],
  ["a-format", "a-screen"], ["a-db", "a-list"], ["a-list", "a-screen"], ["a-rules", "a-list"], ["a-format", "a-db"],
];

// The change "add due dates" touches all of these in the tangled version.
const RIPPLED = new Set(["a-screen", "a-rules", "a-format", "a-db", "a-list"]);

export const whatIsDesign: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "intro");

  if (phase === "intro") {
    return {
      nodes: [{ id: "app", label: "To-do app", position: iso(0, 0, 0.5), size: [2.6, 1, 1.9], tone: "primary" }],
      edges: [],
      messages: [],
      camera: { zoom: 70, target: [0, 0.6, 0] },
    };
  }

  const showA = phase !== "ahead";
  const showB = phase !== "inside";
  const aU = phase === "inside" ? 0 : A_U;
  const bU = phase === "ahead" ? 0 : B_U;

  const aEmphasis = (id: string): Emphasis => {
    if (phase === "ripple") return RIPPLED.has(id) ? "alert" : "normal";
    if (phase === "contained" || phase === "definition") return "dim";
    return "normal";
  };
  const bEmphasis = (id: string): Emphasis =>
    (phase === "ripple" || phase === "contained") && id === "b-logic" ? "highlight" : "normal";

  const nodes: NodeSpec[] = [];
  const edges: EdgeSpec[] = [];
  const layers: LayerSpec[] = [];
  const messages: MessageSpec[] = [];

  if (showA) {
    for (const [id, label, u, v] of TANGLED) {
      nodes.push({ id, label, position: iso(aU + u, v, 0.35), size: [1.15, 0.5, 0.85], tone: "neutral", emphasis: aEmphasis(id) });
    }
    for (const [from, to] of TANGLED_EDGES) {
      edges.push({ id: `${from}>${to}`, from, to, state: phase === "ripple" && RIPPLED.has(from) && RIPPLED.has(to) ? "alert" : "normal" });
    }
    layers.push({
      id: "slab-a", label: phase === "inside" ? "Inside the app" : "Version A", y: 0, tone: "neutral",
      center: isoCenter(aU, 0), extent: [3.9, 3.9],
    });
  }

  if (showB) {
    nodes.push(
      { id: "b-ui", label: "UI", position: iso(bU, 0, 2.3), size: [2, 0.5, 1.5], tone: "primary", emphasis: bEmphasis("b-ui") },
      { id: "b-logic", label: "Task rules", position: iso(bU, 0, 1.3), size: [2, 0.5, 1.5], tone: "secondary", emphasis: bEmphasis("b-logic") },
      { id: "b-store", label: "Storage", position: iso(bU, 0, 0.35), size: [2, 0.5, 1.5], tone: "accent", emphasis: bEmphasis("b-store") },
    );
    const active = phase === "contained" || phase === "ahead";
    edges.push(
      { id: "b-ui>b-logic", from: "b-ui", to: "b-logic", state: active ? "active" : "normal" },
      { id: "b-logic>b-store", from: "b-logic", to: "b-store", state: active ? "active" : "normal" },
    );
    layers.push({ id: "slab-b", label: "Version B", y: 0, tone: "neutral", center: isoCenter(bU, 0), extent: [3.2, 3.2] });
    if (phase === "hero" || phase === "ahead") {
      messages.push({ id: "msg-ui", from: "b-ui", to: "b-logic" });
    }
    if (phase === "ahead") messages.push({ id: "msg-store", from: "b-logic", to: "b-store" });
  }

  if (phase === "request" || phase === "ripple" || phase === "contained") {
    nodes.push({ id: "req", label: "New: due dates", position: iso(0, -0.5, 3.6), size: [1.9, 0.45, 0.9], tone: "secondary", shape: "box" });
    if (phase === "request") {
      messages.push({ id: "req>a", from: "req", to: "a-rules" }, { id: "req>b", from: "req", to: "b-logic" });
    }
  }

  return {
    nodes,
    edges,
    layers,
    messages,
    camera: phase === "inside" || phase === "ahead" ? { zoom: 72, target: [0, 0.9, 0] } : { zoom: 52, target: iso(-0.4, 0, 1.1) },
  };
};
