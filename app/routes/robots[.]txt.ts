import { buildRobots } from "~/seo/sitemap";

export function loader() {
  return new Response(buildRobots(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
