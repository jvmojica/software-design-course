import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, Vector3 } from "three";
import type { MessageSpec, Vec3 } from "../model";
import type { Palette } from "../palette";

const LOOP_S = 1.2;

/** A message or call travelling from one node to another, on a loop. */
export function MessageDot({ message, from, to, palette, reducedMotion }: {
  message: MessageSpec; from: Vec3; to: Vec3; palette: Palette; reducedMotion: boolean;
}) {
  const ref = useRef<Group>(null);
  const a = new Vector3(from[0], from[1] + 0.5, from[2]);
  const b = new Vector3(to[0], to[1] + 0.5, to[2]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0.5 : (clock.elapsedTime % LOOP_S) / LOOP_S;
    ref.current.position.lerpVectors(a, b, t);
    ref.current.position.y += Math.sin(t * Math.PI) * 0.4;
  });

  return (
    <group ref={ref} name={message.id}>
      <mesh>
        <sphereGeometry args={[0.13, 20, 12]} />
        <meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
