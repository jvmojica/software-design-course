import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("lessons", "routes/lessons-index.tsx"),
  route("lessons/:slug", "routes/lesson.tsx"),
  route("about", "routes/about.tsx"),
  route("sitemap.xml", "routes/sitemap[.]xml.ts"),
  route("robots.txt", "routes/robots[.]txt.ts"),
] satisfies RouteConfig;
