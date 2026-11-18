import { expect, test } from "vitest";
import { getLesson, isPublished } from "~/lessons/registry";
import { validateLesson } from "~/lessons/validate";
import { behavioralPatterns } from "~/scene/layouts/behavioral-patterns";

const lesson = getLesson("behavioral-patterns")!;
if (!isPublished(lesson)) throw new Error("lesson 16 must be published");
const phases = lesson.steps.map((s) => s.sceneState.phase as string);

test("lesson 16 is valid with 8–12 steps covering all four patterns", () => {
  expect(validateLesson(lesson)).toEqual([]);
  expect(lesson.scene).toBe("behavioral-patterns");
  expect(lesson.steps.length).toBeGreaterThanOrEqual(8);
  expect(lesson.steps.length).toBeLessThanOrEqual(12);
  for (const p of ["strategy", "observer", "command", "state"]) {
    expect(phases.some((ph) => ph.startsWith(p)), p).toBe(true);
  }
});

test("observer: the subject sends one message to each of its three observers", () => {
  const m = behavioralPatterns({ phase: "observer" });
  const fromStore = (m.messages ?? []).filter((msg) => msg.from === "store").map((msg) => msg.to).sort();
  expect(fromStore).toEqual(["o-analytics", "o-cart", "o-prices"]);
});

test("strategy: exactly one strategy is active, and it changes when swapped", () => {
  const active = (phase: string) => {
    const hi = behavioralPatterns({ phase }).nodes.filter((n) => n.id.startsWith("s-") && n.emphasis === "highlight");
    expect(hi).toHaveLength(1);
    return hi[0].id;
  };
  expect(active("strategy-card")).not.toBe(active("strategy-paypal"));
});

test("command: undo removes the last command from the history", () => {
  const before = behavioralPatterns({ phase: "command-queue" }).nodes.filter((n) => n.id.startsWith("cmd-")).length;
  const after = behavioralPatterns({ phase: "command-undo" }).nodes.filter((n) => n.id.startsWith("cmd-")).length;
  expect(after).toBe(before - 1);
});

test("state: the light points at exactly one current state, which changes", () => {
  const current = (phase: string) => {
    const e = behavioralPatterns({ phase }).edges.filter((x) => x.from === "light" && x.state === "active");
    expect(e).toHaveLength(1);
    return e[0].to;
  };
  expect(current("state-red")).not.toBe(current("state-green"));
});
