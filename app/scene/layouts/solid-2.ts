import type { EdgeSpec, LayerSpec, MessageSpec, NodeSpec, SceneLayout, SceneModel, Tone, Vec3 } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 9. SOLID part 2, one storage story:
 *  LSP — a ReadOnlyStore extends Store but can't save(), so the backup job breaks.
 *  ISP — a fat Store interface forces read-only classes to stub out methods; split into Reader/Writer.
 *  DIP — OrderService depends straight on MySQL; invert it to depend on an OrderRepository
 *        interface that MySQL (and an in-memory test double) implement.
 * Id prefix: "m-" a method chip on the fat interface.
 */
export const PHASES = ["lsp-ok", "lsp-broken", "isp-fat", "isp-split", "dip-direct", "dip-inverted", "dip-swap", "summary"] as const;
type Phase = (typeof PHASES)[number];

const BLOCK: Vec3 = [1.7, 0.45, 1.0];
const SMALL: Vec3 = [1.4, 0.35, 0.85];
const CHIP: Vec3 = [1.15, 0.3, 0.75];

function lsp(phase: "lsp-ok" | "lsp-broken"): SceneModel {
  const kids: [string, string, number][] = [["local", "LocalStore", -2.2], ["cloud", "CloudStore", 0]];
  if (phase === "lsp-broken") kids.push(["readonly", "ReadOnlyStore", 2.2]);
  const nodes: NodeSpec[] = [
    { id: "backup", label: "backup job", position: iso(-3.6, -1.4, 1.6), size: SMALL, tone: "neutral" },
    { id: "store", label: "Store: save()", position: iso(0, -1.4, 1.6), size: BLOCK, tone: "neutral" },
    ...kids.map(([id, label, u]): NodeSpec => ({
      id, label: id === "readonly" ? "ReadOnlyStore: save() throws!" : label, position: iso(u, 1, 0.3), size: SMALL,
      tone: "primary", emphasis: id === "readonly" ? "alert" : "normal",
    })),
  ];
  const edges: EdgeSpec[] = [
    { id: "uses", from: "backup", to: "store" },
    ...kids.map(([id]): EdgeSpec => ({ id: `ext:${id}`, from: id, to: "store", state: id === "readonly" ? "alert" : "normal" })),
  ];
  const messages: MessageSpec[] = kids.map(([id], i) => ({ id: `save:${id}`, from: "backup", to: id, label: i === 0 ? "save()" : undefined }));
  return { nodes, edges, messages, camera: { zoom: 58, target: iso(-0.4, -0.2, 0.9) } };
}

function isp(phase: "isp-fat" | "isp-split"): SceneModel {
  if (phase === "isp-fat") {
    const chips: [string, string, boolean][] = [
      ["m-read", "read()", false], ["m-stats", "stats()", false], ["m-write", "write()", true], ["m-delete", "delete()", true], ["m-backup", "backup()", true],
    ];
    const nodes: NodeSpec[] = [
      { id: "fat", label: "«interface» Store (5 methods)", position: iso(0, -1.9, 1.8), size: [2.4, 0.4, 1.2], tone: "neutral" },
      ...chips.map(([id, label, stub], i): NodeSpec => ({
        id, label: stub ? `${label} ✗` : label, position: iso(-3.4 + i * 1.7, -0.3, 1.0), size: CHIP, tone: "neutral", emphasis: stub ? "alert" : "normal",
      })),
      { id: "readonly", label: "ReadOnlyCache", position: iso(0, 2.0, 0.3), size: BLOCK, tone: "primary" },
    ];
    const edges: EdgeSpec[] = [
      ...chips.map(([id]): EdgeSpec => ({ id: `part:${id}`, from: "fat", to: id, style: "dashed" })),
      ...chips.map(([id, , stub]): EdgeSpec => ({ id: `must:${id}`, from: "readonly", to: id, state: stub ? "alert" : "normal" })),
    ];
    return { nodes, edges, messages: [], camera: { zoom: 54, target: iso(0, 0, 0.8) } };
  }
  return {
    nodes: [
      { id: "reader", label: "«interface» Reader: read(), stats()", position: iso(-1.8, -1.2, 1.5), size: BLOCK, tone: "neutral" },
      { id: "writer", label: "«interface» Writer: write(), delete()", position: iso(1.8, -1.2, 1.5), size: BLOCK, tone: "neutral" },
      { id: "readonly", label: "ReadOnlyCache", position: iso(-1.8, 1.4, 0.3), size: BLOCK, tone: "primary", emphasis: "highlight" },
      { id: "full", label: "DiskStore", position: iso(1.8, 1.4, 0.3), size: BLOCK, tone: "primary" },
    ],
    edges: [
      { id: "impl:ro-reader", from: "readonly", to: "reader", style: "dashed", state: "active" },
      { id: "impl:full-reader", from: "full", to: "reader", style: "dashed" },
      { id: "impl:full-writer", from: "full", to: "writer", style: "dashed" },
    ],
    messages: [], camera: { zoom: 60, target: iso(0, 0, 0.8) },
  };
}

function dip(phase: "dip-direct" | "dip-inverted" | "dip-swap"): SceneModel {
  // Laid out along the world x axis so each layer can be a slim strip under its own row.
  const HIGH = 2.2;
  const nodes: NodeSpec[] = [{ id: "service", label: "OrderService", position: [-0.8, HIGH, 0], size: BLOCK, tone: "secondary" }];
  const edges: EdgeSpec[] = [];
  const layers: LayerSpec[] = [
    { id: "layer-policy", label: "High level: business policy", y: HIGH - 0.3, tone: "secondary", center: [1.2, 0], extent: [6.4, 1.8] },
    { id: "layer-details", label: "Low level: details", y: 0, tone: "neutral", center: [1.8, 0.5], extent: [7.6, 2.8] },
  ];
  if (phase === "dip-direct") {
    nodes.push({ id: "mysql", label: "MySqlDatabase", position: [-0.8, 0.3, 0], size: BLOCK, tone: "neutral", emphasis: "alert" });
    edges.push({ id: "dep:mysql", from: "service", to: "mysql", state: "alert" });
  } else {
    nodes.push(
      { id: "repo", label: "«interface» OrderRepository", position: [2.4, HIGH, 0], size: BLOCK, tone: "secondary", emphasis: phase === "dip-inverted" ? "highlight" : "normal" },
      { id: "mysql", label: "MySqlOrderRepository", position: [2.4, 0.3, 0], size: BLOCK, tone: "neutral" },
    );
    edges.push(
      { id: "dep:repo", from: "service", to: "repo", state: "active" },
      { id: "impl:mysql", from: "mysql", to: "repo", style: "dashed" },
    );
    if (phase === "dip-swap") {
      nodes.push({ id: "memory", label: "InMemoryOrderRepository (tests)", position: [4.8, 0.3, 1.2], size: BLOCK, tone: "accent", emphasis: "highlight" });
      edges.push({ id: "impl:memory", from: "memory", to: "repo", style: "dashed", state: "active" });
    }
  }
  return { nodes, edges, layers, messages: [], camera: { zoom: 56, target: [1.6, 1.0, 0.4] } };
}

function summary(): SceneModel {
  const items: [string, Tone][] = [["Liskov Substitution", "primary"], ["Interface Segregation", "neutral"], ["Dependency Inversion", "secondary"]];
  return {
    nodes: items.map(([label, tone], i) => ({ id: `principle-${i}`, label, position: iso(-3 + i * 3, 0, 0.6), size: [1.5, 1.2, 1.5], tone })),
    edges: [], messages: [], camera: { zoom: 60, target: iso(0, 0, 0.8) },
  };
}

export const solidTwo: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "lsp-ok");
  if (phase === "lsp-ok" || phase === "lsp-broken") return lsp(phase);
  if (phase === "isp-fat" || phase === "isp-split") return isp(phase);
  if (phase === "summary") return summary();
  return dip(phase);
};
