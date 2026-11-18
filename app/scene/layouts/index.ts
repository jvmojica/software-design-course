import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { behavioralPatterns, PHASES as behavioralPhases } from "./behavioral-patterns";
import { composition, PHASES as compositionPhases } from "./composition";
import { couplingCohesion, PHASES as couplingPhases } from "./coupling-cohesion";
import { functions, PHASES as functionsPhases } from "./functions";
import { oopBasics, PHASES as oopBasicsPhases } from "./oop-basics";
import { oopInDepth, PHASES as oopInDepthPhases } from "./oop-in-depth";
import { placeholder } from "./placeholder";
import { separationOfConcerns, PHASES as socPhases } from "./separation-of-concerns";
import { whatIsDesign, PHASES as whatIsDesignPhases } from "./what-is-design";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  functions,
  "oop-basics": oopBasics,
  "oop-in-depth": oopInDepth,
  "separation-of-concerns": separationOfConcerns,
  "what-is-design": whatIsDesign,
  "coupling-cohesion": couplingCohesion,
  composition,
  "behavioral-patterns": behavioralPatterns,
};

/** The phases each scene understands; a test checks every lesson step uses one of them. */
export const scenePhases: Record<SceneId, readonly string[]> = {
  placeholder: [],
  functions: functionsPhases,
  "oop-basics": oopBasicsPhases,
  "oop-in-depth": oopInDepthPhases,
  "separation-of-concerns": socPhases,
  "what-is-design": whatIsDesignPhases,
  "coupling-cohesion": couplingPhases,
  composition: compositionPhases,
  "behavioral-patterns": behavioralPhases,
};
