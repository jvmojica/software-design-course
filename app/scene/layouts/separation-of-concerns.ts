import type { EdgeSpec, Emphasis, LayerSpec, MessageSpec, NodeSpec, SceneLayout, Tone, Vec3 } from "../model";
import { iso, isoCenter, pick } from "./helpers";

/**
 * Lesson 5. A signup feature mixes four concerns in one file: screen (UI), business rules,
 * storage and email. Separated onto their own slabs, each can change on its own: a mobile UI
 * reuses the rules, the database is swapped, and the rules are tested alone.
 */
export const PHASES = ["mixed", "concerns", "separate", "change-ui", "change-db", "test-rules", "summary"] as const;
type Phase = (typeof PHASES)[number];

type Concern = { id: string; fragment: string; name: string; tone: Tone; mixed: [number, number]; home: [number, number]; area: string };

const CONCERNS: Concern[] = [
  { id: "c-ui", fragment: "<form>…</form>", name: "SignupForm", tone: "primary", mixed: [-1.0, -0.8], home: [-3.8, 0], area: "UI" },
  { id: "c-rules", fragment: "if (age < 13) …", name: "SignupRules", tone: "secondary", mixed: [1.0, -0.8], home: [0, 0], area: "Business rules" },
  { id: "c-db", fragment: "INSERT INTO users…", name: "SqliteUserStore", tone: "accent", mixed: [-1.0, 0.8], home: [3.4, -1.8], area: "Storage" },
  { id: "c-mail", fragment: "smtp.send(…)", name: "Mailer", tone: "danger", mixed: [1.0, 0.8], home: [3.4, 1.8], area: "Email" },
];

const BLOCK: Vec3 = [1.6, 0.45, 1.0];

export const separationOfConcerns: SceneLayout = (state) => {
  const phase: Phase = pick(state, "phase", PHASES, "mixed");
  const together = phase === "mixed" || phase === "concerns";

  const emphasis = (c: Concern): Emphasis => {
    if (phase === "test-rules") return c.id === "c-rules" ? "highlight" : "dim";
    if (phase === "change-db" && c.id === "c-db") return "highlight";
    return "normal";
  };
  const label = (c: Concern) => {
    if (phase === "mixed") return c.fragment;
    if (phase === "concerns") return c.area;
    const migrated = phase === "change-db" || phase === "test-rules" || phase === "summary";
    return c.id === "c-db" && migrated ? "PostgresUserStore" : c.name;
  };
  const place = (c: Concern): Vec3 => {
    const [u, v] = together ? c.mixed : c.home;
    const shift = phase === "change-ui" && c.id === "c-ui" ? -1.0 : 0;
    return iso(u, v + shift, 0.3);
  };

  const nodes: NodeSpec[] = CONCERNS.map((c) => ({
    id: c.id, label: label(c), position: place(c), size: together ? [1.3, 0.4, 0.8] : BLOCK, tone: phase === "mixed" ? "neutral" : c.tone, emphasis: emphasis(c),
  }));

  let edges: EdgeSpec[];
  let layers: LayerSpec[];
  const messages: MessageSpec[] = [];

  if (together) {
    // Everything reaches into everything inside one file.
    edges = [];
    for (let i = 0; i < CONCERNS.length; i++) {
      for (let j = i + 1; j < CONCERNS.length; j++) {
        edges.push({ id: `tangle:${CONCERNS[i].id}:${CONCERNS[j].id}`, from: CONCERNS[i].id, to: CONCERNS[j].id, state: phase === "mixed" ? "alert" : "normal" });
      }
    }
    layers = [{ id: "file-signup", label: "signup.ts", y: 0, tone: "neutral", center: isoCenter(0, 0), extent: [3.8, 3.8] }];
  } else {
    edges = [
      { id: "ui>rules", from: "c-ui", to: "c-rules" },
      { id: "rules>db", from: "c-rules", to: "c-db", state: phase === "change-db" ? "active" : "normal" },
      { id: "rules>mail", from: "c-rules", to: "c-mail" },
    ];
    layers = CONCERNS.map((c) => ({ id: `area-${c.id}`, label: c.area, y: 0, tone: "neutral" as const, center: isoCenter(c.home[0], c.home[1]), extent: (c.id === "c-ui" ? [2.8, 2.8] : [2.4, 2.4]) as [number, number] }));
    if (phase === "change-ui") {
      nodes.push({ id: "c-mobile", label: "Mobile app (new)", position: iso(-3.8, 1.0, 0.3), size: BLOCK, tone: "primary", emphasis: "highlight" });
      edges.push({ id: "mobile>rules", from: "c-mobile", to: "c-rules", state: "active" });
    }
    if (phase === "test-rules") {
      nodes.push({ id: "test", label: "rules.test.ts", position: iso(0.4, 3.4, 0.3), size: BLOCK, tone: "neutral", emphasis: "highlight" });
      messages.push({ id: "check", from: "test", to: "c-rules", label: "age: 12" });
    }
  }

  return {
    nodes, edges, layers, messages,
    camera: together ? { zoom: 74, target: iso(0, 0, 0.4) } : { zoom: 54, target: iso(-0.4, 0, 0.4) },
  };
};
