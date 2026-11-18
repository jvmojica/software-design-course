import { expect, test } from "vitest";
import type { CatalogEntry, Lesson } from "~/lessons/types";
import { catalog } from "~/lessons/catalog";
import { breadcrumbJsonLd, courseJsonLd, lessonJsonLd } from "~/seo/jsonld";
import { lessonMeta, pageMeta } from "~/seo/meta";
import { buildRobots, buildSitemap } from "~/seo/sitemap";
import { siteConfig } from "~/site.config";

const url = siteConfig.siteUrl;

const published: Lesson = {
  number: 6, slug: "coupling-and-cohesion", title: "Coupling and cohesion", level: "beginner",
  summary: "Group code that changes together.", status: "published", scene: "placeholder",
  steps: [{ title: "One", body: "x", sceneState: {} }],
};
const comingSoon: CatalogEntry = { ...published, number: 2, slug: "functions-and-naming", status: "coming-soon" };

const find = (meta: Record<string, unknown>[], pred: (m: Record<string, unknown>) => boolean) => meta.find(pred);

test("lessonMeta sets title, canonical and og:image", () => {
  const meta = lessonMeta(published) as Record<string, unknown>[];
  expect(find(meta, (m) => "title" in m)?.title).toBe("Coupling and cohesion · Software Design");
  expect(find(meta, (m) => m.name === "description")?.content).toBe(published.summary);
  expect(find(meta, (m) => m.rel === "canonical")?.href).toBe(`${url}/lessons/coupling-and-cohesion`);
  expect(find(meta, (m) => m.property === "og:image")?.content).toBe(`${url}/og/coupling-and-cohesion.png`);
  expect(find(meta, (m) => m.name === "robots")).toBeUndefined();
});

test("lessonMeta marks coming-soon lessons noindex", () => {
  const meta = lessonMeta(comingSoon) as Record<string, unknown>[];
  expect(find(meta, (m) => m.name === "robots")?.content).toBe("noindex");
});

test("pageMeta builds canonical from path", () => {
  const meta = pageMeta({ title: "Course map", description: "d", path: "/lessons" }) as Record<string, unknown>[];
  expect(find(meta, (m) => m.rel === "canonical")?.href).toBe(`${url}/lessons`);
  expect(find(meta, (m) => m.property === "og:image")?.content).toBe(`${url}/og/default.png`);
});

test("lessonJsonLd is a LearningResource inside the Course", () => {
  const ld = lessonJsonLd(published) as Record<string, any>;
  expect(ld["@type"]).toBe("LearningResource");
  expect(ld.isPartOf["@type"]).toBe("Course");
  expect(ld.educationalLevel).toBe("beginner");
});

test("courseJsonLd and breadcrumbJsonLd have the right types", () => {
  expect((courseJsonLd() as any)["@type"]).toBe("Course");
  const bc = breadcrumbJsonLd([{ name: "Course map", path: "/lessons" }]) as any;
  expect(bc["@type"]).toBe("BreadcrumbList");
  expect(bc.itemListElement[0].item).toBe(`${url}/lessons`);
});

test("sitemap lists static pages and published lessons only", () => {
  const xml = buildSitemap([published, comingSoon]);
  for (const p of ["/", "/lessons", "/about", "/lessons/coupling-and-cohesion"]) {
    expect(xml).toContain(`<loc>${url}${p === "/" ? "/" : p}</loc>`);
  }
  expect(xml).not.toContain("functions-and-naming");
});

test("default sitemap excludes coming-soon lessons from the real catalog", () => {
  const soon = catalog.find((l) => l.status === "coming-soon")!;
  expect(buildSitemap()).not.toContain(soon.slug);
});

test("robots points at the sitemap", () => {
  expect(buildRobots()).toContain(`Sitemap: ${url}/sitemap.xml`);
});
