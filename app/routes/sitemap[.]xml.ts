import { buildSitemap } from "~/seo/sitemap";

export function loader() {
  return new Response(buildSitemap(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
