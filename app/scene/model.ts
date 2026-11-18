/**
 * A scene is plain data. Each lesson's layout function turns a step's `sceneState`
 * into a SceneModel; the renderer draws any SceneModel and tweens between them by id.
 */
export type Tone = "neutral" | "primary" | "secondary" | "accent" | "danger";
export type Emphasis = "normal" | "dim" | "highlight" | "alert";
/** Grid units; y is up. */
export type Vec3 = [number, number, number];

export type NodeSpec = {
  id: string;
  label: string;
  position: Vec3;
  size?: Vec3;
  tone: Tone;
  emphasis?: Emphasis;
  shape?: "box" | "sphere" | "cylinder";
  /** 0..1, default 1. Set by tweening for entering/leaving nodes. */
  opacity?: number;
};

export type EdgeSpec = {
  id: string;
  from: string;
  to: string;
  style?: "solid" | "dashed";
  state?: "normal" | "active" | "alert";
};

/** A flat slab under a group of nodes, e.g. an architecture layer or a module boundary. */
export type LayerSpec = {
  id: string;
  label: string;
  y: number;
  tone: Tone;
  /** Center (x, z) and footprint (width, depth). Defaults to a wide slab at the origin. */
  center?: [number, number];
  extent?: [number, number];
};

/** The renderer loops a small dot from → to. */
export type MessageSpec = { id: string; from: string; to: string; label?: string };

export type SceneModel = {
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  layers?: LayerSpec[];
  messages?: MessageSpec[];
  camera?: { zoom: number; target: Vec3 };
};

export type SceneLayout = (state: Record<string, unknown>) => SceneModel;

export function validateSceneModel(m: SceneModel): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const all = [...m.nodes, ...m.edges, ...(m.layers ?? []), ...(m.messages ?? [])];
  for (const item of all) {
    if (seen.has(item.id)) errors.push(`duplicate id "${item.id}"`);
    seen.add(item.id);
  }
  const nodeIds = new Set(m.nodes.map((n) => n.id));
  for (const link of [...m.edges, ...(m.messages ?? [])]) {
    for (const end of [link.from, link.to]) {
      if (!nodeIds.has(end)) errors.push(`"${link.id}" points at missing node "${end}"`);
    }
  }
  for (const n of m.nodes) {
    if (!n.position.every(Number.isFinite)) errors.push(`node "${n.id}" has a non-finite position`);
  }
  return errors;
}
