import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, type MeshStandardMaterial } from "three";
import type { NodeSpec } from "../model";
import type { Palette } from "../palette";

export const DEFAULT_SIZE: [number, number, number] = [1.6, 0.6, 1.1];

/** A class, module or object: a soft isometric block with a label. */
export function ModuleBox({ node, palette, reducedMotion }: { node: NodeSpec; palette: Palette; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  const emphasis = node.emphasis ?? "normal";
  const size = node.size ?? DEFAULT_SIZE;
  const target = useMemo(() => new Color(emphasis === "alert" ? palette.danger : palette[node.tone]), [emphasis, palette, node.tone]);
  const opacity = (node.opacity ?? 1) * (emphasis === "dim" ? 0.3 : 1);
  const lift = emphasis === "highlight" ? 0.25 : 0;

  useFrame(({ clock }, dt) => {
    if (!mat.current || !group.current) return;
    mat.current.color.lerp(target, reducedMotion ? 1 : Math.min(dt * 8, 1));
    mat.current.opacity = opacity;
    const pulse = emphasis === "alert" && !reducedMotion ? 1 + Math.sin(clock.elapsedTime * 6) * 0.04 : 1;
    group.current.scale.setScalar(pulse);
  });

  const [x, y, z] = node.position;
  const mesh =
    node.shape === "sphere" ? <sphereGeometry args={[size[1], 32, 16]} /> :
    node.shape === "cylinder" ? <cylinderGeometry args={[size[0] / 2, size[0] / 2, size[1], 32]} /> : null;

  return (
    <group ref={group} position={[x, y + lift, z]}>
      {mesh ? (
        <mesh castShadow>
          {mesh}
          <meshStandardMaterial ref={mat} transparent roughness={0.6} />
        </mesh>
      ) : (
        <RoundedBox args={size} radius={0.12} smoothness={4} castShadow>
          <meshStandardMaterial ref={mat} transparent roughness={0.6} />
        </RoundedBox>
      )}
      {opacity > 0.05 && (
        <Html position={[0, size[1] / 2 + 0.35, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <span className={`scene-label scene-label-${emphasis}`} style={{ opacity }}>{node.label}</span>
        </Html>
      )}
    </group>
  );
}
