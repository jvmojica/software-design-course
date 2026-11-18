import type { EdgeSpec, Emphasis, MessageSpec, NodeSpec, SceneLayout, SceneModel, Tone, Vec3 } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 4. A drawing app works with shapes.
 *  Abstraction  — the app sees a simple Shape (draw, area); the hard parts sit hidden behind it.
 *  Inheritance  — Circle, Square, Triangle extend Shape and share its code.
 *  Polymorphism — the app calls draw() on every shape; each answers in its own way, and new shapes
 *                 plug in without the app changing.
 * Id prefixes: "hid-" hidden internals, "ext:" inherits-from edges.
 */
export const PHASES = ["abstraction", "inheritance", "shared", "override", "polymorphism", "poly-new", "pillars"] as const;
type Phase = (typeof PHASES)[number];

const KID: Vec3 = [1.6, 0.45, 1.1];

type Kid = { id: string; name: string; u: number; tone: Tone; shape?: "cylinder" };
const KIDS: Kid[] = [
  { id: "circle", name: "Circle", u: -2.4, tone: "primary", shape: "cylinder" },
  { id: "square", name: "Square", u: 0, tone: "secondary" },
  { id: "triangle", name: "Triangle", u: 2.4, tone: "accent" },
];
const STAR: Kid = { id: "star", name: "Star (new!)", u: 4.8, tone: "danger" };

function pillars(): SceneModel {
  const items: [string, Tone][] = [
    ["Encapsulation", "accent"],
    ["Abstraction", "primary"],
    ["Inheritance", "secondary"],
    ["Polymorphism", "danger"],
  ];
  return {
    nodes: items.map(([label, tone], i): NodeSpec => ({ id: `pillar-${i}`, label, position: iso(-3.3 + i * 2.2, 0, 0.7), size: [1.3, 1.4, 1.3], tone })),
    edges: [], messages: [], camera: { zoom: 64, target: iso(0, 0, 0.9) },
  };
}

export const oopInDepth: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "abstraction");
  if (phase === "pillars") return pillars();

  const app: NodeSpec = { id: "app", label: "drawing app", position: iso(-3.8, -1.2, 1.9), size: [1.7, 0.5, 1.2], tone: "neutral" };
  const shapeLabel = phase === "abstraction" ? "Shape: draw(), area()" : phase === "override" ? "abstract Shape: area() ?" : "Shape · color, move()";
  const shape: NodeSpec = {
    id: "shape", label: shapeLabel, position: iso(0, -1.2, 1.9), size: [2.2, 0.5, 1.4], tone: "neutral",
    emphasis: phase === "shared" || phase === "abstraction" ? "highlight" : "normal",
  };
  const edges: EdgeSpec[] = [{ id: "uses", from: "app", to: "shape", state: phase === "abstraction" ? "active" : "normal" }];

  if (phase === "abstraction") {
    const hidden: NodeSpec[] = [
      // Underneath the simple surface, like a basement the app never visits.
      { id: "hid-geometry", label: "geometry math", position: iso(-2.2, -0.6, 0.2), size: [1.5, 0.35, 0.9], tone: "neutral", emphasis: "dim" },
      { id: "hid-pixels", label: "pixel drawing", position: iso(0, -0.6, 0.2), size: [1.5, 0.35, 0.9], tone: "neutral", emphasis: "dim" },
      { id: "hid-svg", label: "SVG paths", position: iso(2.2, -0.6, 0.2), size: [1.5, 0.35, 0.9], tone: "neutral", emphasis: "dim" },
    ];
    return {
      nodes: [app, shape, ...hidden],
      edges: [...edges, ...hidden.map((h) => ({ id: `impl:${h.id}`, from: "shape", to: h.id, style: "dashed" as const }))],
      messages: [{ id: "call", from: "app", to: "shape", label: "shape.area()" }],
      camera: { zoom: 66, target: iso(-0.8, -0.9, 1.0) },
    };
  }

  const kids = phase === "poly-new" ? [...KIDS, STAR] : KIDS;
  const emphasis = (k: Kid): Emphasis =>
    phase === "override" || (phase === "poly-new" && k.id === "star") ? "highlight" : "normal";

  const nodes: NodeSpec[] = [
    app,
    shape,
    ...kids.map((k): NodeSpec => ({
      id: k.id, label: phase === "override" ? `${k.name}.area()` : k.name,
      position: iso(k.u, 1, 0.3), size: KID, tone: k.tone, shape: k.shape, emphasis: emphasis(k),
    })),
  ];
  for (const k of kids) {
    edges.push({ id: `ext:${k.id}`, from: k.id, to: "shape", state: phase === "shared" ? "active" : "normal", style: phase === "polymorphism" || phase === "poly-new" ? "dashed" : "solid" });
  }

  const messages: MessageSpec[] = phase === "polymorphism" || phase === "poly-new"
    ? kids.map((k, i) => ({ id: `draw:${k.id}`, from: "app", to: k.id, label: i === 0 ? "draw()" : undefined }))
    : [];

  return { nodes, edges, messages, camera: { zoom: phase === "poly-new" ? 52 : 58, target: iso(phase === "poly-new" ? 0.2 : -0.6, 0, 1) } };
};
