import type { SceneId } from "~/lessons/types";
import type { SceneLayout } from "../model";
import { behavioralPatterns, PHASES as behavioralPhases } from "./behavioral-patterns";
import { composition, PHASES as compositionPhases } from "./composition";
import { couplingCohesion, PHASES as couplingPhases } from "./coupling-cohesion";
import { functions, PHASES as functionsPhases } from "./functions";
import { keepSimple, PHASES as keepSimplePhases } from "./keep-simple";
import { oopBasics, PHASES as oopBasicsPhases } from "./oop-basics";
import { oopInDepth, PHASES as oopInDepthPhases } from "./oop-in-depth";
import { placeholder } from "./placeholder";
import { separationOfConcerns, PHASES as socPhases } from "./separation-of-concerns";
import { solidOne, PHASES as solidOnePhases } from "./solid-1";
import { whatIsDesign, PHASES as whatIsDesignPhases } from "./what-is-design";

export const sceneLayouts: Record<SceneId, SceneLayout> = {
  placeholder,
  functions,
  "oop-basics": oopBasics,
  "oop-in-depth": oopInDepth,
  "separation-of-concerns": separationOfConcerns,
  "keep-simple": keepSimple,
  "solid-1": solidOne,
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
  "keep-simple": keepSimplePhases,
  "solid-1": solidOnePhases,
  "what-is-design": whatIsDesignPhases,
  "coupling-cohesion": couplingPhases,
  composition: compositionPhases,
  "behavioral-patterns": behavioralPhases,
};
