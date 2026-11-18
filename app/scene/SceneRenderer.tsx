import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { OrthographicCamera as OrthoCam } from "three";
import type { SceneModel, Vec3 } from "./model";
import { usePalette } from "./usePalette";
import { prefersReducedMotion, useTweenedModel } from "./useTweenedModel";
import { Connector } from "./primitives/Connector";
import { LayerSlab } from "./primitives/LayerSlab";
import { MessageDot } from "./primitives/MessageDot";
import { ModuleBox } from "./primitives/ModuleBox";

const ISO_DIR: Vec3 = [1, 1, 1];
const DISTANCE = 20;
const BASE_WIDTH = 800; // zoom values in layouts are tuned for an 800px-wide canvas

function IsoCamera({ zoom, target }: { zoom: number; target: Vec3 }) {
  const camera = useThree((s) => s.camera) as OrthoCam;
  const width = useThree((s) => s.size.width);
  const len = Math.hypot(...ISO_DIR);
  useEffect(() => {
    camera.position.set(
      target[0] + (ISO_DIR[0] / len) * DISTANCE,
      target[1] + (ISO_DIR[1] / len) * DISTANCE,
      target[2] + (ISO_DIR[2] / len) * DISTANCE,
    );
    camera.zoom = zoom * Math.min(Math.max(width / BASE_WIDTH, 0.45), 1.4);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, zoom, target, width, len]);
  return null;
}

function Scene({ model }: { model: SceneModel }) {
  const shown = useTweenedModel(model);
  const palette = usePalette();
  const [reduced] = useState(prefersReducedMotion);
  const pos = useMemo(() => new Map(shown.nodes.map((n) => [n.id, n.position])), [shown]);
  const cam = shown.camera ?? { zoom: 60, target: [0, 0, 0] as Vec3 };

  return (
    <>
      <OrthographicCamera makeDefault near={0.1} far={100} />
      <IsoCamera zoom={cam.zoom} target={cam.target} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 12, 4]} intensity={1.6} />
      <hemisphereLight args={[palette.bg, palette.ink, 0.4]} />
      {shown.layers?.map((l) => <LayerSlab key={l.id} layer={l} palette={palette} />)}
      {shown.nodes.map((n) => <ModuleBox key={n.id} node={n} palette={palette} reducedMotion={reduced} />)}
      {shown.edges.map((e) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        return a && b ? <Connector key={e.id} edge={e} from={a} to={b} palette={palette} /> : null;
      })}
      {shown.messages?.map((m) => {
        const a = pos.get(m.from);
        const b = pos.get(m.to);
        return a && b ? <MessageDot key={m.id} message={m} from={a} to={b} palette={palette} reducedMotion={reduced} /> : null;
      })}
    </>
  );
}

export default function SceneRenderer({ model }: { model: SceneModel }) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} aria-hidden="true">
      <Scene model={model} />
    </Canvas>
  );
}
