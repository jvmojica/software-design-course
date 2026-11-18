import type { EdgeSpec, NodeSpec, SceneLayout, SceneModel, Vec3 } from "../model";
import { iso, isoCenter, pick } from "./helpers";

/**
 * Lesson 3. A bank account's data (cylinders) and functions (blocks) start out loose, so any code
 * can write the balance directly. A class bundles them; objects are made from the class; making the
 * data private forces outside code through methods, which guard the rules and hide the internals.
 * Id prefixes: "d-" data, "m-" method, "out-" outside code, "obj-" object.
 */
export const PHASES = ["loose", "danger", "class", "objects", "encapsulation", "guard", "change-inside", "summary"] as const;
type Phase = (typeof PHASES)[number];

const METHOD: Vec3 = [1.3, 0.4, 0.9];
const DATA: Vec3 = [1.0, 0.5, 1.0];
const OUTSIDE: Vec3 = [1.5, 0.45, 1.0];

const LOOSE_POS: Record<string, Vec3> = {
  "d-balance": iso(2.2, -0.5, 0.3), "d-owner": iso(1.5, 1.6, 0.3),
  "m-deposit": iso(-0.7, -1.6, 0.25), "m-withdraw": iso(0.3, 0.2, 0.25), "m-statement": iso(-0.4, 1.7, 0.25),
};
const CLASS_POS: Record<string, Vec3> = {
  // Methods face the outside world (left column); data sits behind them (right column).
  "d-balance": iso(2.1, -0.9, 0.35), "d-owner": iso(2.1, 1.0, 0.35), "d-transactions": iso(2.1, -0.9, 0.35),
  "m-deposit": iso(-0.3, -1.7, 0.3), "m-withdraw": iso(-0.3, 0, 0.3), "m-statement": iso(-0.3, 1.7, 0.3),
};

function objects(): SceneModel {
  return {
    nodes: [
      { id: "cls", label: "class BankAccount (blueprint)", position: iso(0, -1.2, 1.7), size: [2.2, 0.4, 1.4], tone: "primary", emphasis: "dim" },
      { id: "obj-alice", label: "alice · balance 120", position: iso(-1.8, 1, 0.35), size: [1.7, 0.6, 1.2], tone: "primary" },
      { id: "obj-bob", label: "bob · balance 40", position: iso(1.8, 1, 0.35), size: [1.7, 0.6, 1.2], tone: "primary" },
    ],
    edges: [
      { id: "new:alice", from: "cls", to: "obj-alice", style: "dashed" },
      { id: "new:bob", from: "cls", to: "obj-bob", style: "dashed" },
    ],
    messages: [],
    camera: { zoom: 70, target: iso(0, 0, 0.8) },
  };
}

export const oopBasics: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "loose");
  if (phase === "objects") return objects();

  const loose = phase === "loose" || phase === "danger";
  const privateData = !loose && phase !== "class";
  const pos = loose ? LOOSE_POS : CLASS_POS;
  const internals = phase === "change-inside" ? "d-transactions" : "d-balance";

  const nodes: NodeSpec[] = [
    { id: "out-checkout", label: "checkout.ts", position: iso(-3.6, -1.7, 0.3), size: OUTSIDE, tone: "neutral" },
    { id: "out-admin", label: "admin.ts", position: iso(-3.6, 0, 0.3), size: OUTSIDE, tone: "neutral" },
    internals === "d-balance"
      ? {
          id: "d-balance", shape: "cylinder", size: DATA, tone: "accent", position: pos["d-balance"],
          label: phase === "danger" ? "balance = -500 ?!" : privateData ? "#balance (private)" : "balance",
          emphasis: phase === "danger" ? "alert" : "normal",
        }
      : { id: "d-transactions", shape: "cylinder", size: DATA, tone: "accent", position: pos["d-transactions"], label: "#transactions[] (private)", emphasis: "highlight" },
    { id: "d-owner", shape: "cylinder", size: DATA, tone: "accent", position: pos["d-owner"], label: privateData ? "#owner (private)" : "owner" },
    { id: "m-deposit", label: "deposit()", position: pos["m-deposit"], size: METHOD, tone: "primary" },
    { id: "m-withdraw", label: "withdraw()", position: pos["m-withdraw"], size: METHOD, tone: "primary", emphasis: phase === "guard" ? "highlight" : "normal" },
    { id: "m-statement", label: "statement()", position: pos["m-statement"], size: METHOD, tone: "primary" },
  ];

  const edges: EdgeSpec[] = [
    { id: "use:deposit", from: "m-deposit", to: internals },
    { id: "use:withdraw", from: "m-withdraw", to: internals },
    { id: "use:statement", from: "m-statement", to: internals },
    { id: "use:owner", from: "m-statement", to: "d-owner" },
  ];
  if (privateData) {
    edges.push(
      { id: "out:checkout", from: "out-checkout", to: "m-deposit", state: phase === "summary" ? "active" : "normal" },
      { id: "out:admin", from: "out-admin", to: "m-withdraw", state: phase === "guard" ? "active" : "normal" },
    );
  } else {
    edges.push(
      { id: "out:checkout-direct", from: "out-checkout", to: "d-balance" },
      { id: "out:admin-direct", from: "out-admin", to: "d-balance", state: phase === "danger" ? "alert" : "normal" },
    );
  }

  const messages = phase === "guard" ? [{ id: "try", from: "out-admin", to: "m-withdraw", label: "withdraw(1000)" }]
    : phase === "danger" ? [{ id: "write", from: "out-admin", to: "d-balance", label: "balance = -500" }] : [];

  return {
    nodes,
    edges,
    layers: loose ? [] : [{ id: "class-BankAccount", label: "class BankAccount", y: 0, tone: "primary", center: isoCenter(0.9, 0), extent: [4.8, 4.8] }],
    messages,
    camera: { zoom: 64, target: iso(-0.8, 0, 0.2) },
  };
};
