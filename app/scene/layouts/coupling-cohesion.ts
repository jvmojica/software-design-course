import type { EdgeSpec, Emphasis, NodeSpec, SceneLayout, Tone } from "../model";
import { iso, isoCenter, pick } from "./helpers";

/**
 * Lesson 6. Nine functions in three files. Colors show which functions belong together
 * (users / orders / email). First they're scattered across files with many cross-file calls;
 * then they're regrouped so each file is cohesive and only two calls cross a boundary.
 */
export const PHASES = ["scattered", "coupling", "cohesion", "change", "regroup", "clean-coupling", "clean-change", "summary"] as const;
type Phase = (typeof PHASES)[number];

type Fn = { id: string; group: "users" | "orders" | "email"; messy: [number, number]; clean: [number, number] };

// [module index, slot index] before and after regrouping.
const FUNCTIONS: Fn[] = [
  { id: "createUser", group: "users", messy: [0, 0], clean: [0, 0] },
  { id: "hashPw", group: "users", messy: [1, 0], clean: [0, 1] },
  { id: "checkEmail", group: "users", messy: [2, 0], clean: [0, 2] },
  { id: "placeOrder", group: "orders", messy: [1, 1], clean: [1, 0] },
  { id: "total", group: "orders", messy: [0, 1], clean: [1, 1] },
  { id: "discount", group: "orders", messy: [2, 1], clean: [1, 2] },
  { id: "send", group: "email", messy: [0, 2], clean: [2, 0] },
  { id: "template", group: "email", messy: [1, 2], clean: [2, 1] },
  { id: "queue", group: "email", messy: [2, 2], clean: [2, 2] },
];

const CALLS: [string, string][] = [
  ["createUser", "hashPw"], ["createUser", "checkEmail"], ["createUser", "send"],
  ["placeOrder", "total"], ["total", "discount"], ["placeOrder", "send"],
  ["send", "template"], ["send", "queue"],
];

const TONE: Record<Fn["group"], Tone> = { users: "primary", orders: "secondary", email: "accent" };
const MODULE_U = [-3.7, 0, 3.7];
const SLOTS: [number, number][] = [[-0.75, -0.55], [0.75, -0.55], [0, 0.75]];
const MESSY_FILES = ["helpers.ts", "utils.ts", "main.ts"];
const CLEAN_FILES = ["users.ts", "orders.ts", "email.ts"];
const EMAIL_CHANGE = new Set(["send", "template", "queue"]);

export const couplingCohesion: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "scattered");
  const clean = ["regroup", "clean-coupling", "clean-change", "summary"].includes(phase);
  const slotOf = (f: Fn) => (clean ? f.clean : f.messy);
  const moduleOf = new Map(FUNCTIONS.map((f) => [f.id, slotOf(f)[0]]));

  const emphasis = (f: Fn): Emphasis => {
    if (phase === "cohesion") return moduleOf.get(f.id) === 0 ? "highlight" : "dim";
    if (phase === "change" || phase === "clean-change") return EMAIL_CHANGE.has(f.id) ? "alert" : "dim";
    return "normal";
  };

  const nodes: NodeSpec[] = FUNCTIONS.map((f) => {
    const [mod, slot] = slotOf(f);
    const [du, dv] = SLOTS[slot];
    return { id: f.id, label: f.id, position: iso(MODULE_U[mod] + du, dv, 0.3), size: [1.05, 0.4, 0.7], tone: TONE[f.group], emphasis: emphasis(f) };
  });

  const showCrossing = phase === "coupling" || phase === "clean-coupling";
  const edges: EdgeSpec[] = CALLS.map(([from, to]) => {
    const crosses = moduleOf.get(from) !== moduleOf.get(to);
    return {
      id: `${from}>${to}`, from, to,
      state: showCrossing && crosses ? (clean ? "active" : "alert") : "normal",
      style: showCrossing && !crosses ? "dashed" : "solid",
    };
  });

  const files = clean ? CLEAN_FILES : MESSY_FILES;
  const layers = MODULE_U.map((u, i) => ({
    id: `mod-${i}`, label: files[i], y: 0, tone: "neutral" as const, center: isoCenter(u, 0), extent: [3.1, 3.1] as [number, number],
  }));

  return { nodes, edges, layers, messages: [], camera: { zoom: 50, target: iso(0, 0, 0.6) } };
};
