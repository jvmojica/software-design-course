import type { EdgeSpec, MessageSpec, NodeSpec, SceneLayout, SceneModel, Tone, Vec3 } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 8. SOLID part 1.
 *  SRP — one Report class serves three groups of people (finance, design, IT); their requests
 *        collide; split into one class per group.
 *  OCP — a DiscountCalculator with a switch must be edited for every new customer type; with a
 *        DiscountRule interface, a new type is a new class and the calculator never changes.
 * Id prefixes: "actor-" people who request changes, "case-" switch branches, "rule-" rule classes.
 */
export const PHASES = ["srp-god", "srp-conflict", "srp-split", "ocp-switch", "ocp-edit", "ocp-open", "ocp-extend", "summary"] as const;
type Phase = (typeof PHASES)[number];

const BLOCK: Vec3 = [1.7, 0.45, 1.0];
const SMALL: Vec3 = [1.4, 0.35, 0.85];

const ACTORS: [string, string, number, string, string][] = [
  // id, label, v, class id after split, class label after split
  ["actor-finance", "Finance team", -1.8, "c-calc", "ReportCalculator"],
  ["actor-design", "Design team", 0, "c-format", "ReportFormatter"],
  ["actor-it", "IT / ops", 1.8, "c-mail", "ReportMailer"],
];

function srp(phase: "srp-god" | "srp-conflict" | "srp-split"): SceneModel {
  const nodes: NodeSpec[] = ACTORS.map(([id, label, v]) => ({ id, label, position: iso(-3.4, v, 0.3), size: SMALL, tone: "neutral", shape: "cylinder" }));
  const edges: EdgeSpec[] = [];
  const messages: MessageSpec[] = [];
  if (phase === "srp-split") {
    for (const [actor, , v, cls, clsLabel] of ACTORS) {
      nodes.push({ id: cls, label: clsLabel, position: iso(0.8, v, 0.3), size: BLOCK, tone: "primary" });
      edges.push({ id: `owns:${actor}`, from: actor, to: cls, state: "active" });
    }
  } else {
    nodes.push({
      id: "report", label: "Report: calculate + format + email", position: iso(0.8, 0, 0.5), size: [2.4, 0.9, 2.6], tone: "primary",
      emphasis: phase === "srp-conflict" ? "alert" : "normal",
    });
    for (const [actor] of ACTORS) edges.push({ id: `owns:${actor}`, from: actor, to: "report", state: phase === "srp-conflict" && actor !== "actor-it" ? "alert" : "normal" });
    if (phase === "srp-conflict") {
      messages.push({ id: "req-finance", from: "actor-finance", to: "report", label: "new tax rules" }, { id: "req-design", from: "actor-design", to: "report" });
    }
  }
  return { nodes, edges, messages, camera: { zoom: 62, target: iso(-1.2, 0, 0.4) } };
}

const RULES: [string, string, number][] = [["regular", "Regular", -2.4], ["student", "Student", 0], ["senior", "Senior", 2.4]];

function ocp(phase: "ocp-switch" | "ocp-edit" | "ocp-open" | "ocp-extend"): SceneModel {
  const nodes: NodeSpec[] = [
    { id: "checkout", label: "checkout", position: iso(-3.6, -1.6, 1.6), size: SMALL, tone: "neutral" },
    { id: "calc", label: "DiscountCalculator", position: iso(0, -1.6, 1.6), size: BLOCK, tone: "secondary", emphasis: phase === "ocp-edit" ? "alert" : "normal" },
  ];
  const edges: EdgeSpec[] = [{ id: "uses-calc", from: "checkout", to: "calc" }];

  if (phase === "ocp-switch" || phase === "ocp-edit") {
    const cases = phase === "ocp-edit" ? [...RULES, ["vip", "VIP (edit!)", 4.8] as [string, string, number]] : RULES;
    for (const [id, label, u] of cases) {
      nodes.push({ id: `case-${id}`, label: `case ${label}`, position: iso(u, 1, 0.25), size: SMALL, tone: "neutral", emphasis: id === "vip" ? "alert" : "normal" });
      edges.push({ id: `branch:${id}`, from: "calc", to: `case-${id}`, state: phase === "ocp-edit" ? "alert" : "normal" });
    }
    return { nodes, edges, messages: [], camera: { zoom: phase === "ocp-edit" ? 52 : 58, target: iso(phase === "ocp-edit" ? 0.6 : 0, -0.2, 0.9) } };
  }

  nodes.push({ id: "iface", label: "«interface» DiscountRule", position: iso(2.8, -1.6, 1.6), size: BLOCK, tone: "neutral" });
  edges.push({ id: "uses-rule", from: "calc", to: "iface" });
  const rules = phase === "ocp-extend" ? [...RULES, ["vip", "VipRule (new)", 4.8] as [string, string, number]] : RULES;
  for (const [id, label, u] of rules) {
    const isNew = id === "vip";
    nodes.push({ id: `rule-${id}`, label: isNew ? label : `${label}Rule`, position: iso(u + 1.2, 1.2, 0.25), size: SMALL, tone: "accent", emphasis: isNew ? "highlight" : "normal" });
    edges.push({ id: `impl:${id}`, from: `rule-${id}`, to: "iface", style: "dashed", state: isNew ? "active" : "normal" });
  }
  return { nodes, edges, messages: [], camera: { zoom: phase === "ocp-extend" ? 50 : 54, target: iso(phase === "ocp-extend" ? 1.4 : 0.8, -0.2, 0.9) } };
}

function summary(): SceneModel {
  const items: [string, Tone][] = [["Single Responsibility", "primary"], ["Open/Closed", "secondary"]];
  return {
    nodes: items.map(([label, tone], i) => ({ id: `principle-${i}`, label, position: iso(-1.5 + i * 3, 0, 0.6), size: [1.6, 1.2, 1.6], tone })),
    edges: [], messages: [], camera: { zoom: 70, target: iso(0, 0, 0.8) },
  };
}

export const solidOne: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "srp-god");
  if (phase === "srp-god" || phase === "srp-conflict" || phase === "srp-split") return srp(phase);
  if (phase === "summary") return summary();
  return ocp(phase);
};
