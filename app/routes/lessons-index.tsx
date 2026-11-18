import type { MetaFunction } from "react-router";
import { CourseMap } from "~/components/CourseMap";
import { JsonLd } from "~/components/JsonLd";
import { courseJsonLd } from "~/seo/jsonld";
import { pageMeta } from "~/seo/meta";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "Course map · Software Design",
    description: "All 21 lessons of the free interactive software design course, from beginner to advanced.",
    path: "/lessons",
  });

export default function LessonsIndex() {
  return (
    <main className="wrap">
      <h1 className="page-title">Course map</h1>
      <p className="lesson-lede">21 lessons in three levels. Each one is a 3D scene you step through.</p>
      <CourseMap />
      <JsonLd data={courseJsonLd()} />
    </main>
  );
}
