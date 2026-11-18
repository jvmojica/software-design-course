import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { placeholder } from "./placeholder";
import { whatIsDesign } from "./what-is-design";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  "what-is-design": whatIsDesign,
  "coupling-cohesion": placeholder,
  composition: placeholder,
  "behavioral-patterns": placeholder,
};
