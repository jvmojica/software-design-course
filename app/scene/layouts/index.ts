import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { placeholder } from "./placeholder";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  "what-is-design": placeholder,
  "coupling-cohesion": placeholder,
  composition: placeholder,
  "behavioral-patterns": placeholder,
};
