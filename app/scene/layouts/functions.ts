import type { EdgeSpec, Emphasis, LayerSpec, NodeSpec, SceneLayout, Tone } from "../model";
import { iso, isoCenter, pick } from "./helpers";

/**
 * Lesson 2. One giant processOrder() hides four jobs. The jobs show up as bands inside it,
 * slide out into small functions, get real names, and the top function becomes a short story
 * that reads like a to-do list. Then one small function gets reused elsewhere.
 */
export const PHASES = ["monolith", "sections", "extract", "names", "one-job", "reuse", "levels", "summary"] as const;
type Phase = (typeof PHASES)[number];

type Fn = { id: string; tone: Tone; comment: string; vague: string; clear: string };

const FNS: Fn[] = [
  { id: "f-validate", tone: "primary", comment: "// check the input", vague: "doStuff()", clear: "validateOrder()" },
  { id: "f-total", tone: "secondary", comment: "// add up prices", vague: "calc2()", clear: "calculateTotal()" },
  { id: "f-charge", tone: "accent", comment: "// take payment", vague: "handle()", clear: "chargeCard()" },
  { id: "f-receipt", tone: "neutral", comment: "// email receipt", vague: "x()", clear: "sendReceipt()" },
];

const ROW_U = [-3.3, -1.1, 1.1, 3.3];
const TOP = iso(0, -1.2, 2.3);

export const functions: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "monolith");

  if (phase === "monolith") {
    return {
      nodes: [{ id: "processOrder", label: "processOrder() — 120 lines", position: iso(0, 0, 1.1), size: [2.2, 2.2, 1.6], tone: "neutral" }],
      edges: [], messages: [], camera: { zoom: 70, target: iso(0, 0, 1.1) },
    };
  }

  if (phase === "sections") {
    // The four hidden jobs, still stacked inside the shape of the big function.
    return {
      nodes: FNS.map((f, i): NodeSpec => ({ id: f.id, label: f.comment, position: iso(0, 0, 0.3 + i * 0.55), size: [2.2, 0.5, 1.6], tone: f.tone })),
      edges: [], messages: [], camera: { zoom: 70, target: iso(0, 0, 1.1) },
    };
  }

  const named = phase !== "extract";
  const emphasis = (f: Fn): Emphasis => {
    if (phase === "one-job") return f.id === "f-charge" ? "highlight" : "dim";
    if (phase === "reuse") return f.id === "f-total" ? "highlight" : "normal";
    return "normal";
  };

  const nodes: NodeSpec[] = [
    { id: "processOrder", label: "processOrder()", position: TOP, size: [2.2, 0.5, 1.4], tone: "neutral", emphasis: phase === "one-job" ? "dim" : "normal" },
    ...FNS.map((f, i): NodeSpec => ({
      id: f.id, label: named ? f.clear : f.vague, position: iso(ROW_U[i], 1, 0.3), size: [1.8, 0.45, 1.1], tone: f.tone, emphasis: emphasis(f),
    })),
  ];
  const edges: EdgeSpec[] = FNS.map((f) => ({ id: `call:${f.id}`, from: "processOrder", to: f.id }));

  if (phase === "reuse" || phase === "summary") {
    nodes.push({ id: "showCart", label: "showCart()", position: iso(-3.6, -1.2, 2.3), size: [1.8, 0.5, 1.2], tone: "secondary", emphasis: phase === "reuse" ? "highlight" : "normal" });
    edges.push({ id: "call:cart-total", from: "showCart", to: "f-total", state: phase === "reuse" ? "active" : "normal" });
  }

  const layers: LayerSpec[] = phase === "levels" || phase === "summary"
    ? [
        { id: "layer-story", label: "The story: what happens", y: 1.95, tone: "neutral", center: isoCenter(0, -1.2), extent: [2.8, 2.8] },
        { id: "layer-details", label: "The details: how", y: 0, tone: "neutral", center: isoCenter(0, 1), extent: [6.6, 6.6] },
      ]
    : [];

  return { nodes, edges, layers, messages: [], camera: { zoom: 56, target: iso(0, 0, 1) } };
};
