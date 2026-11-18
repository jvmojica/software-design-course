/** Generates a 1200×630 social preview image for every lesson, plus a default one. Run before the build. */
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import satori from "satori";
import { catalog } from "../app/lessons/catalog";
import { LEVEL_LABEL, type CatalogEntry } from "../app/lessons/types";

const require = createRequire(import.meta.url);
const fontFile = (w: 400 | 700) =>
  readFileSync(require.resolve(`@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${w}-normal.woff`));
const fonts = [
  { name: "Atkinson", data: fontFile(400), weight: 400 as const, style: "normal" as const },
  { name: "Atkinson", data: fontFile(700), weight: 700 as const, style: "normal" as const },
];

const C = { bg: "#f6f1e9", ink: "#2b2724", muted: "#6b635a", primary: "#4a7c8c", secondary: "#c9a14a", accent: "#7a9a6b" };

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): El => ({ type, props: { style, children } });

/** Three stacked isometric-looking blocks: the site's visual mark. */
const blocks = () =>
  h("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }, [
    C.secondary, C.primary, C.accent,
  ].map((c, i) => h("div", { width: 150, height: 50, borderRadius: 14, background: c, transform: `translateX(${(i - 1) * 22}px) skewX(-18deg)` })));

function card(p: { eyebrow: string; title: string; footer: string }): El {
  // Absolute boxes: satori treats padding on the root as extra size, so lay out explicitly inside 1200×630.
  return h("div", { position: "relative", width: 1200, height: 630, display: "flex", background: C.bg, fontFamily: "Atkinson", color: C.ink }, [
    h("div", { position: "absolute", left: 72, top: 64, width: 780, height: 502, display: "flex", flexDirection: "column", justifyContent: "space-between" }, [
      h("div", { display: "flex", fontSize: 30, fontWeight: 700, color: C.primary }, p.eyebrow),
      h("div", { display: "flex", fontSize: p.title.length > 48 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }, p.title),
      h("div", { display: "flex", fontSize: 28, color: C.muted }, p.footer),
    ]),
    h("div", { position: "absolute", left: 900, top: 0, width: 240, height: 630, display: "flex", alignItems: "center", justifyContent: "center" }, blocks()),
  ]);
}

async function toPng(el: El): Promise<Buffer> {
  const svg = await satori(el as never, { width: 1200, height: 630, fonts });
  return Buffer.from(new Resvg(svg).render().asPng());
}

export function renderOgImage(entry: CatalogEntry): Promise<Buffer> {
  return toPng(card({
    eyebrow: `${LEVEL_LABEL[entry.level]} · Lesson ${entry.number} of ${catalog.length}`,
    title: entry.title,
    footer: "Software Design — a free interactive course",
  }));
}

export function renderDefaultOgImage(): Promise<Buffer> {
  return toPng(card({
    eyebrow: "A free, interactive course",
    title: "Software Design",
    footer: "21 lessons · from your first class to clean architecture",
  }));
}

async function main() {
  const out = join(process.cwd(), "public", "og");
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "default.png"), await renderDefaultOgImage());
  for (const e of catalog) writeFileSync(join(out, `${e.slug}.png`), await renderOgImage(e));
  console.log(`og-images: wrote ${catalog.length + 1} images to public/og`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
