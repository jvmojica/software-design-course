import type { NodeSpec, SceneModel, Vec3 } from "./model";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/**
 * Blend two scene models at t ∈ [0, 1], matching nodes by id.
 * Shared nodes move; nodes only in `to` fade in; nodes only in `from` fade out.
 * Discrete properties (tone, emphasis, label) and edges/layers/messages come from `to`;
 * the renderer smooths colors itself.
 */
export function interpolateModel(from: SceneModel, to: SceneModel, t: number): SceneModel {
  if (t >= 1) return to;
  const prev = new Map(from.nodes.map((n) => [n.id, n]));
  const nextIds = new Set(to.nodes.map((n) => n.id));

  const nodes: NodeSpec[] = to.nodes.map((n) => {
    const p = prev.get(n.id);
    return p
      ? { ...n, position: lerp3(p.position, n.position, t), opacity: lerp(p.opacity ?? 1, n.opacity ?? 1, t) }
      : { ...n, opacity: (n.opacity ?? 1) * t };
  });
  for (const p of from.nodes) {
    if (!nextIds.has(p.id)) nodes.push({ ...p, opacity: (p.opacity ?? 1) * (1 - t) });
  }

  const present = new Set(nodes.map((n) => n.id));
  return {
    ...to,
    nodes,
    edges: to.edges.filter((e) => present.has(e.from) && present.has(e.to)),
  };
}
