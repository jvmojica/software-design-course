import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { behavioralPatterns, PHASES as behavioralPhases } from "./behavioral-patterns";
import { composition, PHASES as compositionPhases } from "./composition";
import { couplingCohesion, PHASES as couplingPhases } from "./coupling-cohesion";
import { placeholder } from "./placeholder";
import { whatIsDesign, PHASES as whatIsDesignPhases } from "./what-is-design";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  "what-is-design": whatIsDesign,
  "coupling-cohesion": couplingCohesion,
  composition,
  "behavioral-patterns": behavioralPatterns,
};

/** The phases each scene understands; a test checks every lesson step uses one of them. */
export const scenePhases: Record<SceneId, readonly string[]> = {
  placeholder: [],
  "what-is-design": whatIsDesignPhases,
  "coupling-cohesion": couplingPhases,
  composition: compositionPhases,
  "behavioral-patterns": behavioralPhases,
};
