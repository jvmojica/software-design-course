import { Html, RoundedBox } from "@react-three/drei";
import type { LayerSpec } from "../model";
import type { Palette } from "../palette";

/** A flat slab under a group of nodes: a layer, a module boundary, a context. */
export function LayerSlab({ layer, palette }: { layer: LayerSpec; palette: Palette }) {
  const [cx, cz] = layer.center ?? [0, 0];
  const [w, d] = layer.extent ?? [10, 4];
  return (
    <group position={[cx, layer.y, cz]}>
      <RoundedBox args={[w, 0.1, d]} radius={0.05} smoothness={2} receiveShadow>
        <meshStandardMaterial color={palette[layer.tone]} transparent opacity={0.35} roughness={0.9} />
      </RoundedBox>
      <Html position={[-w / 2 + 0.2, 0.1, d / 2 - 0.2]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="scene-layer-label">{layer.label}</span>
      </Html>
    </group>
  );
}
