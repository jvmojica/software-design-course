import type { Lesson } from "~/lessons/types";
import { siteConfig } from "~/site.config";

const COURSE_DESCRIPTION =
  "A free, interactive software design course: every idea is an animated 3D scene you step through — from functions and OOP to SOLID, design patterns and clean architecture.";

export function courseJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: siteConfig.siteName,
    description: COURSE_DESCRIPTION,
    url: `${siteConfig.siteUrl}/`,
    isAccessibleForFree: true,
    inLanguage: "en",
    provider: { "@type": "Person", name: siteConfig.author },
  };
}

export function lessonJsonLd(l: Lesson): object {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: l.title,
    description: l.summary,
    url: `${siteConfig.siteUrl}/lessons/${l.slug}`,
    position: l.number,
    educationalLevel: l.level,
    learningResourceType: "Interactive lesson",
    isAccessibleForFree: true,
    inLanguage: "en",
    isPartOf: { "@type": "Course", name: siteConfig.siteName, url: `${siteConfig.siteUrl}/` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteConfig.siteUrl}${it.path}`,
    })),
  };
}
