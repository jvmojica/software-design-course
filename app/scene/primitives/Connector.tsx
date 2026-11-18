import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { EdgeSpec, Vec3 } from "../model";
import type { Palette } from "../palette";

const INSET = 0.75; // stop short of the block centers so arrows meet block edges

/** A dependency arrow from one node to another. */
export function Connector({ edge, from, to, palette }: { edge: EdgeSpec; from: Vec3; to: Vec3; palette: Palette }) {
  const { start, end, quat } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();
    const inset = Math.min(INSET, len / 3);
    const s = a.clone().addScaledVector(dir, inset);
    const e = b.clone().addScaledVector(dir, -inset);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
    return { start: s, end: e, quat: q };
  }, [from, to]);

  const state = edge.state ?? "normal";
  const color = state === "alert" ? palette.danger : state === "active" ? palette.primary : palette.edge;
  const width = state === "normal" ? 2 : 3.5;

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={width} dashed={edge.style === "dashed"} dashSize={0.18} gapSize={0.12} />
      <mesh position={end} quaternion={quat}>
        <coneGeometry args={[0.09, 0.24, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
