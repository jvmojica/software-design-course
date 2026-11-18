import type { EdgeSpec, MessageSpec, NodeSpec, SceneLayout, SceneModel } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 16. Four small scenes, one per pattern:
 *  Strategy — Checkout plugs in one payment strategy at a time.
 *  Observer — a Store broadcasts changes to whoever subscribed.
 *  Command  — actions become objects in a history, so they can be undone.
 *  State    — a traffic light delegates to its current state object.
 */
const PHASES = [
  "intro", "strategy-problem", "strategy-card", "strategy-paypal", "observer", "observer-add",
  "command-queue", "command-undo", "state-red", "state-green", "summary",
] as const;
type Phase = (typeof PHASES)[number];

const BLOCK: [number, number, number] = [1.6, 0.45, 1.0];
const SMALL: [number, number, number] = [1.3, 0.4, 0.9];

function overview(phase: "intro" | "summary"): SceneModel {
  const labels = phase === "intro"
    ? ["Strategy", "Observer", "Command", "State"]
    : ["Strategy: swap how", "Observer: broadcast", "Command: actions as objects", "State: behave by state"];
  const tones = ["primary", "accent", "secondary", "neutral"] as const;
  const nodes: NodeSpec[] = labels.map((label, i) => ({
    id: `p-${i}`, label, position: iso(-3.3 + i * 2.2, 0, 0.35), size: [1.6, 0.6, 1.6], tone: tones[i],
  }));
  return { nodes, edges: [], messages: [], camera: { zoom: 64, target: iso(0, 0, 0.6) } };
}

function strategy(phase: Phase): SceneModel {
  if (phase === "strategy-problem") {
    return {
      nodes: [
        { id: "checkout", label: "Checkout: if card… else if PayPal… else if crypto…", position: iso(0, 0, 0.5), size: [3.2, 0.9, 1.6], tone: "secondary", emphasis: "alert" },
      ],
      edges: [], messages: [], camera: { zoom: 64, target: iso(0, 0, 0.6) },
    };
  }
  const active = phase === "strategy-card" ? "s-card" : "s-paypal";
  const strategies: [string, string, number][] = [["s-card", "CardPayment", -2.4], ["s-paypal", "PayPalPayment", 0], ["s-crypto", "CryptoPayment", 2.4]];
  const nodes: NodeSpec[] = [
    { id: "checkout", label: "Checkout", position: iso(0, -1.3, 1.6), size: BLOCK, tone: "secondary" },
    ...strategies.map(([id, label, u]): NodeSpec => ({
      id, label, position: iso(u, 1, 0.3), size: SMALL, tone: "primary", emphasis: id === active ? "highlight" : "dim",
    })),
  ];
  const edges: EdgeSpec[] = [{ id: "uses", from: "checkout", to: active, state: "active" }];
  const messages: MessageSpec[] = [{ id: "pay", from: "checkout", to: active, label: "pay(total)" }];
  return { nodes, edges, messages, camera: { zoom: 72, target: iso(0, 0, 0.8) } };
}

function observer(phase: Phase): SceneModel {
  const subs: [string, string][] = [["o-cart", "Cart badge"], ["o-prices", "Price list"], ["o-analytics", "Analytics"]];
  if (phase === "observer-add") subs.push(["o-wishlist", "Wishlist"]);
  const n = subs.length;
  const nodes: NodeSpec[] = [
    { id: "store", label: "Store (subject)", position: iso(0, -1.2, 1.4), size: BLOCK, tone: "accent" },
    ...subs.map(([id, label], i): NodeSpec => ({
      id, label, position: iso((i - (n - 1) / 2) * 2.3, 1.1, 0.3), size: SMALL, tone: "neutral",
      emphasis: id === "o-wishlist" ? "highlight" : "normal",
    })),
  ];
  const edges: EdgeSpec[] = subs.map(([id]) => ({ id: `sub:${id}`, from: id, to: "store", style: "dashed" }));
  const messages: MessageSpec[] = subs.map(([id]) => ({ id: `notify:${id}`, from: "store", to: id }));
  return { nodes, edges, messages, camera: { zoom: 70, target: iso(0, 0, 0.7) } };
}

function command(phase: Phase): SceneModel {
  const cmds: [string, string][] = [["cmd-bold", "Bold"], ["cmd-italic", "Italic"], ["cmd-delete", "Delete word"]];
  const history = phase === "command-undo" ? cmds.slice(0, 2) : cmds;
  const nodes: NodeSpec[] = [
    { id: "toolbar", label: "Toolbar", position: iso(-3.2, 0, 0.35), size: BLOCK, tone: "neutral" },
    { id: "editor", label: "Editor", position: iso(3.2, 0, 0.35), size: BLOCK, tone: "primary", emphasis: phase === "command-undo" ? "highlight" : "normal" },
    ...history.map(([id, label], i): NodeSpec => ({
      id, label, position: iso(0, 0, 0.3 + i * 0.5), size: [1.5, 0.4, 1.1], tone: "secondary",
      emphasis: phase === "command-queue" && i === history.length - 1 ? "highlight" : "normal",
    })),
  ];
  const top = history[history.length - 1][0];
  const edges: EdgeSpec[] = [
    { id: "issue", from: "toolbar", to: top },
    { id: "run", from: top, to: "editor", state: "active" },
  ];
  const messages: MessageSpec[] = phase === "command-undo"
    ? [{ id: "undo", from: top, to: "editor", label: "undo()" }]
    : [{ id: "exec", from: "toolbar", to: top, label: "execute()" }];
  return { nodes, edges, messages, camera: { zoom: 68, target: iso(0, 0, 0.9) } };
}

function stateScene(phase: Phase): SceneModel {
  const current = phase === "state-red" ? "st-red" : "st-green";
  const states: [string, string, number, number, "danger" | "accent" | "secondary"][] = [
    ["st-red", "RedState", -2.4, 0.9, "danger"],
    ["st-green", "GreenState", 0, 1.5, "accent"],
    ["st-yellow", "YellowState", 2.4, 0.9, "secondary"],
  ];
  const nodes: NodeSpec[] = [
    { id: "light", label: "TrafficLight", position: iso(0, -1.3, 1.3), size: BLOCK, tone: "neutral" },
    ...states.map(([id, label, u, v, tone]): NodeSpec => ({
      id, label, position: iso(u, v, 0.3), size: SMALL, tone, emphasis: id === current ? "highlight" : "dim",
    })),
  ];
  const edges: EdgeSpec[] = [
    { id: "current", from: "light", to: current, state: "active" },
    { id: "next:red", from: "st-red", to: "st-green", style: "dashed" },
    { id: "next:green", from: "st-green", to: "st-yellow", style: "dashed" },
    { id: "next:yellow", from: "st-yellow", to: "st-red", style: "dashed" },
  ];
  return { nodes, edges, messages: [{ id: "tick", from: "light", to: current, label: "next()" }], camera: { zoom: 72, target: iso(0, 0, 0.7) } };
}

export const behavioralPatterns: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "intro");
  if (phase === "intro" || phase === "summary") return overview(phase);
  if (phase.startsWith("strategy")) return strategy(phase);
  if (phase.startsWith("observer")) return observer(phase);
  if (phase.startsWith("command")) return command(phase);
  return stateScene(phase);
};
