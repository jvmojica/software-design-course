import type { MetaDescriptor } from "react-router";
import type { CatalogEntry } from "~/lessons/types";
import { siteConfig } from "~/site.config";

const abs = (path: string) => `${siteConfig.siteUrl}${path === "/" ? "/" : path}`;

function base(p: { title: string; description: string; path: string; image: string; type: string }): MetaDescriptor[] {
  return [
    { title: p.title },
    { name: "description", content: p.description },
    { tagName: "link", rel: "canonical", href: abs(p.path) },
    { property: "og:type", content: p.type },
    { property: "og:site_name", content: siteConfig.siteName },
    { property: "og:title", content: p.title },
    { property: "og:description", content: p.description },
    { property: "og:url", content: abs(p.path) },
    { property: "og:image", content: p.image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: p.title },
    { name: "twitter:description", content: p.description },
    { name: "twitter:image", content: p.image },
  ];
}

export function lessonMeta(entry: CatalogEntry): MetaDescriptor[] {
  const meta = base({
    title: `${entry.title} · ${siteConfig.siteName}`,
    description: entry.summary,
    path: `/lessons/${entry.slug}`,
    image: `${siteConfig.siteUrl}/og/${entry.slug}.png`,
    type: "article",
  });
  if (entry.status === "coming-soon") meta.push({ name: "robots", content: "noindex" });
  return meta;
}

export function pageMeta(p: { title: string; description: string; path: string }): MetaDescriptor[] {
  return base({ ...p, image: `${siteConfig.siteUrl}/og/default.png`, type: "website" });
}
