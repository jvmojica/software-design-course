import { DEFAULT_SIZE, HIGHLIGHT_LIFT, type Emphasis, type SceneModel, type Vec3 } from "./model";

export type LabelItem = {
  id: string;
  text: string;
  anchor: Vec3;
  kind: "node" | "layer" | "message";
  emphasis: Emphasis;
  opacity: number;
};

/** Where each label sits in the world. Pure, so it is unit-tested; the renderer projects anchors to the screen. */
export function labelItems(m: SceneModel): LabelItem[] {
  const items: LabelItem[] = [];
  const pos = new Map(m.nodes.map((n) => [n.id, n.position]));
  for (const n of m.nodes) {
    const emphasis = n.emphasis ?? "normal";
    const opacity = (n.opacity ?? 1) * (emphasis === "dim" ? 0.35 : 1);
    if (opacity < 0.05) continue;
    const h = (n.size ?? DEFAULT_SIZE)[1];
    const lift = emphasis === "highlight" ? HIGHLIGHT_LIFT : 0;
    items.push({ id: n.id, text: n.label, anchor: [n.position[0], n.position[1] + h / 2 + 0.3 + lift, n.position[2]], kind: "node", emphasis, opacity });
  }
  for (const l of m.layers ?? []) {
    const [cx, cz] = l.center ?? [0, 0];
    const [w, d] = l.extent ?? [10, 4];
    // front-left corner of the slab as seen by the isometric camera
    items.push({ id: l.id, text: l.label, anchor: [cx - w / 2 + 0.3, l.y + 0.1, cz + d / 2 - 0.3], kind: "layer", emphasis: "normal", opacity: 1 });
  }
  for (const msg of m.messages ?? []) {
    const a = pos.get(msg.from);
    const b = pos.get(msg.to);
    if (!msg.label || !a || !b) continue;
    items.push({ id: msg.id, text: msg.label, anchor: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.9, (a[2] + b[2]) / 2], kind: "message", emphasis: "normal", opacity: 1 });
  }
  return items;
}
