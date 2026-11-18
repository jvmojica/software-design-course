/** Verifies the pre-rendered build has everything search engines need. Fails the build on any problem. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { catalog } from "../app/lessons/catalog";
import { isPublished } from "../app/lessons/registry";

const decode = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const checks: [string, RegExp][] = [
  ["a <title>", /<title>[^<]+<\/title>/],
  ["a meta description", /<meta name="description" content="[^"]+"/],
  ["a canonical link", /<link rel="canonical" href="[^"]+"/],
  ["an og:image", /<meta property="og:image" content="[^"]+"/],
  ["JSON-LD", /<script type="application\/ld\+json">/],
];

export function checkPrerender(buildDir: string): string[] {
  const errors: string[] = [];

  for (const entry of catalog) {
    const file = join(buildDir, "lessons", entry.slug, "index.html");
    if (!existsSync(file)) continue; // a missing page is caught by the count check in main()
    const html = readFileSync(file, "utf8");
    const where = `lessons/${entry.slug}`;
    for (const [what, re] of checks) if (!re.test(html)) errors.push(`${where}: missing ${what}`);
    const noindex = /<meta name="robots" content="noindex"/.test(html);
    if (isPublished(entry)) {
      if (noindex) errors.push(`${where}: published lesson is marked noindex`);
      const text = decode(html);
      for (const s of entry.steps) if (!text.includes(s.title)) errors.push(`${where}: step title "${s.title}" missing from HTML`);
    } else if (!noindex) {
      errors.push(`${where}: coming-soon lesson must be noindex`);
    }
  }

  const sitemapFile = join(buildDir, "sitemap.xml");
  if (!existsSync(sitemapFile)) errors.push("sitemap.xml missing");
  else {
    const sitemap = readFileSync(sitemapFile, "utf8");
    for (const e of catalog) {
      const listed = sitemap.includes(`/lessons/${e.slug}<`);
      if (listed && !isPublished(e)) errors.push(`sitemap lists coming-soon lesson ${e.slug}`);
      if (!listed && isPublished(e)) errors.push(`sitemap is missing published lesson ${e.slug}`);
    }
  }
  return errors;
}

function main() {
  const dir = join(process.cwd(), "build", "client");
  const errors = checkPrerender(dir);
  const missing = catalog.filter((e) => !existsSync(join(dir, "lessons", e.slug, "index.html")));
  for (const e of missing) errors.push(`lessons/${e.slug}: page was not pre-rendered`);
  for (const p of ["index.html", "lessons/index.html", "about/index.html", "robots.txt"]) {
    if (!existsSync(join(dir, p))) errors.push(`${p} was not pre-rendered`);
  }
  if (errors.length) {
    console.error(`check-prerender: ${errors.length} problem(s)\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`check-prerender: ${catalog.length + 3} pages OK`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
