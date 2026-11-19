import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { solidOne } from "~/scene/layouts/solid-1";

const lesson = getLessonWithContent("solid-part-1") as Lesson;
if (!lesson) throw new Error("lesson 8 must be published");

const node = (phase: string, id: string) => solidOne({ phase }).nodes.find((n) => n.id === id);
const edgesFrom = (phase: string, id: string) => solidOne({ phase }).edges.filter((e) => e.from === id).map((e) => e.to).sort();

test("lesson 8 is valid with 7–9 steps covering both principles", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("solid-1");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
  const phases = lesson.steps.map((s) => String(s.sceneState.phase));
  expect(phases.some((p) => p.startsWith("srp"))).toBe(true);
  expect(phases.some((p) => p.startsWith("ocp"))).toBe(true);
});

test("SRP, god class: three different groups of people all depend on one class", () => {
  const m = solidOne({ phase: "srp-god" });
  const actors = m.nodes.filter((n) => n.id.startsWith("actor-"));
  expect(actors).toHaveLength(3);
  for (const a of actors) expect(edgesFrom("srp-god", a.id)).toEqual(["report"]);
});

test("SRP, conflict: two requests at once put the shared class in trouble", () => {
  const m = solidOne({ phase: "srp-conflict" });
  expect(node("srp-conflict", "report")?.emphasis).toBe("alert");
  expect(new Set((m.messages ?? []).filter((msg) => msg.to === "report").map((msg) => msg.from)).size).toBeGreaterThanOrEqual(2);
});

test("SRP, split: each class answers to exactly one group, and each group to one class", () => {
  const m = solidOne({ phase: "srp-split" });
  expect(m.nodes.some((n) => n.id === "report")).toBe(false);
  const actorEdges = m.edges.filter((e) => e.from.startsWith("actor-"));
  const perActor = new Map<string, Set<string>>();
  const perClass = new Map<string, Set<string>>();
  for (const e of actorEdges) {
    perActor.set(e.from, (perActor.get(e.from) ?? new Set()).add(e.to));
    perClass.set(e.to, (perClass.get(e.to) ?? new Set()).add(e.from));
  }
  expect(perActor.size).toBe(3);
  for (const s of [...perActor.values(), ...perClass.values()]) expect(s.size).toBe(1);
});

test("OCP, switch: adding a customer type means editing the calculator", () => {
  expect(node("ocp-switch", "calc")?.emphasis ?? "normal").toBe("normal");
  expect(node("ocp-edit", "calc")?.emphasis).toBe("alert");
  expect(node("ocp-edit", "case-vip")).toBeDefined();
});

test("OCP, extend: a new rule plugs in and the calculator is untouched", () => {
  expect(edgesFrom("ocp-extend", "calc")).toEqual(edgesFrom("ocp-open", "calc"));
  expect(node("ocp-extend", "calc")?.emphasis ?? "normal").toBe("normal");
  expect(node("ocp-extend", "rule-vip")?.emphasis).toBe("highlight");
  expect(edgesFrom("ocp-extend", "rule-vip")).toEqual(["iface"]);
  expect(solidOne({ phase: "ocp-open" }).nodes.some((n) => n.id.startsWith("case-"))).toBe(false);
});

test("summary names both principles", () => {
  const labels = solidOne({ phase: "summary" }).nodes.map((n) => n.label);
  expect(labels.some((l) => /Single Responsibility/.test(l))).toBe(true);
  expect(labels.some((l) => /Open\/Closed/.test(l))).toBe(true);
});
