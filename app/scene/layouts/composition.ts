import type { EdgeSpec, NodeSpec, SceneLayout } from "../model";
import { iso, pick } from "./helpers";

/**
 * Lesson 10. A class tree (Animal → Bird / Fish → Sparrow, Penguin) works until a Duck needs
 * to fly AND swim. Then the tree is replaced by small capability blocks that objects are built from.
 * Edge ids: "ext:" = inherits from (child → parent), "has:" = composed of (object → capability).
 */
export const PHASES = ["tree", "penguin", "duck", "capabilities", "compose", "new-animal", "summary"] as const;
type Phase = (typeof PHASES)[number];

const CLASS = { size: [1.6, 0.45, 1.0] as [number, number, number] };
const CAP = { size: [1.3, 0.35, 1.3] as [number, number, number], shape: "cylinder" as const };

export const composition: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "tree");
  const inheritance = phase === "tree" || phase === "penguin" || phase === "duck";
  const nodes: NodeSpec[] = [];
  const edges: EdgeSpec[] = [];

  if (inheritance) {
    nodes.push(
      { id: "animal", label: "Animal", position: iso(0, 0, 2.6), ...CLASS, tone: "neutral" },
      { id: "bird", label: "Bird · fly()", position: iso(-2, 0, 1.5), ...CLASS, tone: "primary" },
      { id: "fish", label: "Fish · swim()", position: iso(2, 0, 1.5), ...CLASS, tone: "accent" },
      { id: "sparrow", label: "Sparrow", position: iso(-3.2, 0, 0.35), ...CLASS, tone: "primary" },
      { id: "penguin", label: "Penguin", position: iso(-1, 0, 0.35), ...CLASS, tone: "primary",
        emphasis: phase === "penguin" ? "alert" : "normal" },
    );
    edges.push(
      { id: "ext:bird", from: "bird", to: "animal" },
      { id: "ext:fish", from: "fish", to: "animal" },
      { id: "ext:sparrow", from: "sparrow", to: "bird" },
      { id: "ext:penguin", from: "penguin", to: "bird", state: phase === "penguin" ? "alert" : "normal" },
    );
    if (phase === "duck") {
      nodes.push({ id: "duck", label: "Duck: fly + swim?", position: iso(1.4, 0.4, 0.35), ...CLASS, tone: "secondary", emphasis: "alert" });
      edges.push(
        { id: "want:bird", from: "duck", to: "bird", style: "dashed", state: "alert" },
        { id: "want:fish", from: "duck", to: "fish", style: "dashed", state: "alert" },
      );
    }
    return { nodes, edges, messages: [], camera: { zoom: 68, target: iso(-0.3, 0, 1.3) } };
  }

  // Composition: capabilities at the back, objects at the front.
  nodes.push(
    { id: "canFly", label: "CanFly", position: iso(-2.4, -1.4, 0.3), ...CAP, tone: "primary" },
    { id: "canSwim", label: "CanSwim", position: iso(0, -1.4, 0.3), ...CAP, tone: "accent" },
    { id: "canWalk", label: "CanWalk", position: iso(2.4, -1.4, 0.3), ...CAP, tone: "neutral" },
  );
  if (phase === "capabilities") {
    return { nodes, edges, messages: [], camera: { zoom: 74, target: iso(0, -0.4, 0.6) } };
  }

  const objects: [string, string, number, string[]][] = [
    ["sparrow", "Sparrow", -3.6, ["canFly", "canWalk"]],
    ["penguin", "Penguin", -1.2, ["canSwim", "canWalk"]],
    ["duck", "Duck", 1.2, ["canFly", "canSwim", "canWalk"]],
    ["fish", "Fish", 3.6, ["canSwim"]],
  ];
  if (phase === "new-animal" || phase === "summary") objects.push(["flyingFish", "Flying fish", 0, ["canSwim", "canFly"]]);

  for (const [id, label, u, caps] of objects) {
    const isNew = id === "flyingFish";
    nodes.push({
      id, label, position: isNew ? iso(0, 1.9, 0.35) : iso(u, 1, 0.35), ...CLASS, tone: "secondary",
      emphasis: (phase === "new-animal" && isNew) || (phase === "compose" && id === "duck") ? "highlight" : "normal",
    });
    for (const c of caps) {
      edges.push({ id: `has:${id}:${c}`, from: id, to: c, state: (phase === "new-animal" && isNew) || (phase === "compose" && id === "duck") ? "active" : "normal" });
    }
  }
  return { nodes, edges, messages: [], camera: { zoom: 62, target: iso(0, 0.2, 0.5) } };
};
