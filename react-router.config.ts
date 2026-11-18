import type { Config } from "@react-router/dev/config";
import { catalog } from "./app/lessons/catalog";

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/lessons",
      "/about",
      "/sitemap.xml",
      "/robots.txt",
      ...catalog.map((l) => `/lessons/${l.slug}`),
    ];
  },
} satisfies Config;
