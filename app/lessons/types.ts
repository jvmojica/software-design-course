export type Level = "beginner" | "intermediate" | "advanced";
export type LessonStatus = "published" | "coming-soon";

export type SceneId =
  | "placeholder"
  | "functions"
  | "oop-basics"
  | "oop-in-depth"
  | "separation-of-concerns"
  | "keep-simple"
  | "what-is-design"
  | "coupling-cohesion"
  | "composition"
  | "behavioral-patterns";

export type CatalogEntry = {
  number: number;
  slug: string;
  title: string;
  level: Level;
  /** One sentence, at most 160 chars — used as the meta description. */
  summary: string;
  status: LessonStatus;
};

export type Step = {
  title: string;
  /** Markdown. */
  body: string;
  code?: { lang: "ts"; source: string; highlight?: number[] };
  sceneState: Record<string, unknown>;
};

export type Lesson = CatalogEntry & { scene: SceneId; steps: Step[] };

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
