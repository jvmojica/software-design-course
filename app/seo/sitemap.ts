import { catalog } from "~/lessons/catalog";
import type { CatalogEntry } from "~/lessons/types";
import { siteConfig } from "~/site.config";

export const STATIC_PATHS = ["/", "/lessons", "/about"];

/** Sitemap of static pages plus published lessons. Coming-soon stubs are left out. */
export function buildSitemap(entries: CatalogEntry[] = catalog): string {
  const paths = [
    ...STATIC_PATHS,
    ...entries.filter((e) => e.status === "published").map((e) => `/lessons/${e.slug}`),
  ];
  const urls = paths.map((p) => `  <url><loc>${siteConfig.siteUrl}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`;
}
