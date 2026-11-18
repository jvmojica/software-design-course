import type { EdgeSpec, NodeSpec, SceneLayout, SceneModel, Tone, Vec3 } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 7. Three small scenes:
 *  DRY   — a tax rule copied into three places; a rate change misses one copy; then one shared rule.
 *  KISS  — a five-part "clever" design for checking if a number is even, versus one line.
 *  YAGNI — a CSV export surrounded by imagined future features, versus just the CSV export.
 * Id prefixes: "copy-" duplicated rule, "maybe-" speculative feature.
 */
export const PHASES = ["dry-copies", "dry-change", "dry-fixed", "kiss-clever", "kiss-simple", "yagni-future", "yagni-now", "summary"] as const;
type Phase = (typeof PHASES)[number];

const BLOCK: Vec3 = [1.6, 0.45, 1.0];
const SMALL: Vec3 = [1.5, 0.35, 0.9];
const CALLERS: [string, string, number][] = [["cart", "cart.ts", -2.6], ["checkout", "checkout.ts", 0], ["invoice", "invoice.ts", 2.6]];

function dry(phase: "dry-copies" | "dry-change" | "dry-fixed"): SceneModel {
  const nodes: NodeSpec[] = CALLERS.map(([id, label, u]) => ({ id, label, position: iso(u, -1, 0.3), size: BLOCK, tone: "neutral" }));
  const edges: EdgeSpec[] = [];
  if (phase === "dry-fixed") {
    nodes.push({ id: "tax", label: "calculateTax()", position: iso(0, 1.5, 0.3), size: BLOCK, tone: "secondary", emphasis: "highlight" });
    for (const [id] of CALLERS) edges.push({ id: `use:${id}`, from: id, to: "tax", state: "active" });
  } else {
    CALLERS.forEach(([id, , u], i) => {
      const missed = phase === "dry-change" && i === 2;
      nodes.push({
        id: `copy-${id}`,
        label: phase === "dry-copies" ? "tax = price × 0.20" : missed ? "price × 0.20 ✗ missed" : "price × 0.25 ✓",
        position: iso(u, 1, 0.25), size: SMALL, tone: "secondary",
        emphasis: phase === "dry-change" ? (missed ? "alert" : "highlight") : "normal",
      });
      edges.push({ id: `has:${id}`, from: id, to: `copy-${id}`, state: missed ? "alert" : "normal" });
    });
  }
  return { nodes, edges, messages: [], camera: { zoom: 64, target: iso(0, 0, 0.4) } };
}

function kiss(phase: "kiss-clever" | "kiss-simple"): SceneModel {
  if (phase === "kiss-simple") {
    return {
      nodes: [{ id: "k-simple", label: "isEven = n % 2 === 0", position: iso(0, 0, 0.35), size: [2.4, 0.5, 1.4], tone: "accent", emphasis: "highlight" }],
      edges: [], messages: [], camera: { zoom: 70, target: iso(0, 0, 0.4) },
    };
  }
  const parts: [string, string, number, number, Tone][] = [
    ["k-factory", "ParityCheckerFactory", -2.4, -1, "neutral"],
    ["k-strategy", "ParityStrategy", 0, -1.6, "neutral"],
    ["k-config", "ParityConfig", 2.4, -1, "neutral"],
    ["k-engine", "ModuloEngine", 1.6, 1.2, "neutral"],
    ["k-result", "ParityResult", -1.6, 1.2, "neutral"],
  ];
  return {
    nodes: parts.map(([id, label, u, v, tone]) => ({ id, label, position: iso(u, v, 0.3), size: SMALL, tone, emphasis: "alert" as const })),
    edges: [
      { id: "k1", from: "k-factory", to: "k-strategy" }, { id: "k2", from: "k-strategy", to: "k-config" },
      { id: "k3", from: "k-config", to: "k-engine" }, { id: "k4", from: "k-engine", to: "k-result" },
      { id: "k5", from: "k-result", to: "k-factory" }, { id: "k6", from: "k-strategy", to: "k-engine" },
    ],
    messages: [], camera: { zoom: 64, target: iso(0, -0.1, 0.4) },
  };
}

function yagni(phase: "yagni-future" | "yagni-now"): SceneModel {
  const nodes: NodeSpec[] = [
    { id: "users", label: "users page", position: iso(-2.8, 0, 0.3), size: BLOCK, tone: "neutral" },
    { id: "csv", label: "exportCsv()", position: iso(0, 0, 0.3), size: BLOCK, tone: "primary", emphasis: phase === "yagni-now" ? "highlight" : "normal" },
  ];
  const edges: EdgeSpec[] = [{ id: "export", from: "users", to: "csv", state: phase === "yagni-now" ? "active" : "normal" }];
  if (phase === "yagni-future") {
    const maybes: [string, string, number, number][] = [
      ["maybe-pdf", "PDF export (someday?)", 2.4, -1.4],
      ["maybe-xml", "XML export (maybe?)", 3.0, 0.4],
      ["maybe-plugins", "Exporter plugin system", 1.0, 2.0],
      ["maybe-schedule", "Scheduled exports", -0.9, -2.0],
    ];
    for (const [id, label, u, v] of maybes) {
      nodes.push({ id, label, position: iso(u, v, 0.25), size: SMALL, tone: "neutral", emphasis: "dim" });
      edges.push({ id: `spec:${id}`, from: "csv", to: id, style: "dashed" });
    }
  }
  return { nodes, edges, messages: [], camera: { zoom: phase === "yagni-future" ? 60 : 70, target: iso(0, 0, 0.4) } };
}

function summary(): SceneModel {
  const items: [string, Tone][] = [["DRY", "secondary"], ["KISS", "accent"], ["YAGNI", "primary"]];
  return {
    nodes: items.map(([label, tone], i) => ({ id: `rule-${i}`, label, position: iso(-2.8 + i * 2.8, 0, 0.6), size: [1.5, 1.2, 1.5], tone })),
    edges: [], messages: [], camera: { zoom: 64, target: iso(0, 0, 0.8) },
  };
}

export const keepSimple: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "dry-copies");
  if (phase === "dry-copies" || phase === "dry-change" || phase === "dry-fixed") return dry(phase);
  if (phase === "kiss-clever" || phase === "kiss-simple") return kiss(phase);
  if (phase === "yagni-future" || phase === "yagni-now") return yagni(phase);
  return summary();
};
