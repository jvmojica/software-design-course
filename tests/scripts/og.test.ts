// @vitest-environment node
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { catalog } from "~/lessons/catalog";
import { checkPrerender } from "../../scripts/check-prerender";
import { renderOgImage } from "../../scripts/og-images";

test("renderOgImage returns a 1200×630 PNG", async () => {
  const png = await renderOgImage(catalog[0]);
  expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
}, 30_000);

test("checkPrerender reports a lesson page missing its description", () => {
  const dir = mkdtempSync(join(tmpdir(), "build-bad-"));
  const slug = catalog[1].slug;
  mkdirSync(join(dir, "lessons", slug), { recursive: true });
  writeFileSync(join(dir, "lessons", slug, "index.html"), "<html><head><title>x</title></head><body></body></html>");
  writeFileSync(join(dir, "sitemap.xml"), "<urlset></urlset>");
  const errors = checkPrerender(dir);
  expect(errors.some((e) => e.includes(slug) && /description/.test(e))).toBe(true);
});

test("checkPrerender reports a coming-soon slug listed in the sitemap", () => {
  const dir = mkdtempSync(join(tmpdir(), "build-bad-"));
  const soon = catalog.find((l) => l.status === "coming-soon")!;
  writeFileSync(join(dir, "sitemap.xml"), `<urlset><url><loc>https://x/lessons/${soon.slug}</loc></url></urlset>`);
  expect(checkPrerender(dir).some((e) => e.includes("sitemap") && e.includes(soon.slug))).toBe(true);
});
