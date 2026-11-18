import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { couplingCohesion } from "./coupling-cohesion";
import { placeholder } from "./placeholder";
import { whatIsDesign } from "./what-is-design";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  "what-is-design": whatIsDesign,
  "coupling-cohesion": couplingCohesion,
  composition: placeholder,
  "behavioral-patterns": placeholder,
};
