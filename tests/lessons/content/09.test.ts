import { expect, test } from "vitest";
import { getLessonWithContent } from "~/lessons/content.server";
import type { Lesson } from "~/lessons/types";
import { validateLesson } from "~/lessons/validate";
import { solidTwo } from "~/scene/layouts/solid-2";

const lesson = getLessonWithContent("solid-part-2") as Lesson;
if (!lesson) throw new Error("lesson 9 must be published");

const node = (phase: string, id: string) => solidTwo({ phase }).nodes.find((n) => n.id === id);
const targets = (phase: string, from: string) => solidTwo({ phase }).edges.filter((e) => e.from === from).map((e) => e.to).sort();

test("lesson 9 is valid with 7–9 steps covering L, I and D", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("solid-2");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
  expect(lesson.steps.length).toBeLessThanOrEqual(9);
  const phases = lesson.steps.map((s) => String(s.sceneState.phase));
  for (const p of ["lsp", "isp", "dip"]) expect(phases.some((ph) => ph.startsWith(p)), p).toBe(true);
});

test("LSP, broken: a subclass that can't keep the parent's promise fails the caller", () => {
  const m = solidTwo({ phase: "lsp-broken" });
  expect(node("lsp-broken", "readonly")?.emphasis).toBe("alert");
  expect(targets("lsp-broken", "readonly")).toEqual(["store"]);
  expect(m.messages?.some((msg) => msg.from === "backup" && msg.to === "readonly")).toBe(true);
  expect(node("lsp-ok", "readonly")).toBeUndefined();
});

test("ISP, fat interface: a read-only class is forced to stub out methods it can't support", () => {
  const m = solidTwo({ phase: "isp-fat" });
  const chips = m.nodes.filter((n) => n.id.startsWith("m-"));
  expect(chips.length).toBeGreaterThanOrEqual(4);
  expect(targets("isp-fat", "readonly")).toEqual(chips.map((c) => c.id).sort());
  expect(chips.filter((c) => c.emphasis === "alert").length).toBeGreaterThanOrEqual(2);
});

test("ISP, split: each class depends only on the small interfaces it really uses", () => {
  expect(targets("isp-split", "readonly")).toEqual(["reader"]);
  expect(targets("isp-split", "full")).toEqual(["reader", "writer"]);
  expect(solidTwo({ phase: "isp-split" }).nodes.some((n) => n.id.startsWith("m-"))).toBe(false);
});

test("DIP, direct: the high-level service depends straight on a low-level detail", () => {
  expect(targets("dip-direct", "service")).toEqual(["mysql"]);
  expect(node("dip-direct", "mysql")!.position[1]).toBeLessThan(node("dip-direct", "service")!.position[1]);
});

test("DIP, inverted: both sides depend on an abstraction owned by the high level", () => {
  expect(targets("dip-inverted", "service")).toEqual(["repo"]);
  expect(targets("dip-inverted", "mysql")).toEqual(["repo"]);
  expect(node("dip-inverted", "repo")!.position[1]).toBe(node("dip-inverted", "service")!.position[1]);
});

test("DIP, swap: a test double plugs in and the service doesn't change", () => {
  expect(targets("dip-swap", "service")).toEqual(targets("dip-inverted", "service"));
  expect(targets("dip-swap", "memory")).toEqual(["repo"]);
  expect(node("dip-swap", "memory")?.emphasis).toBe("highlight");
});

test("summary names all three principles", () => {
  const labels = solidTwo({ phase: "summary" }).nodes.map((n) => n.label);
  for (const p of ["Liskov", "Interface Segregation", "Dependency Inversion"]) expect(labels.some((l) => l.includes(p)), p).toBe(true);
});
