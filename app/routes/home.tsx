import { Link, type MetaFunction } from "react-router";
import { CourseMap } from "~/components/CourseMap";
import { EmailSignup } from "~/components/EmailSignup";
import { JsonLd } from "~/components/JsonLd";
import { catalog } from "~/lessons/catalog";
import { SceneCanvas } from "~/scene/SceneCanvas";
import { courseJsonLd } from "~/seo/jsonld";
import { pageMeta } from "~/seo/meta";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "Software Design — a free interactive course",
    description:
      "Learn software design by stepping through animated 3D scenes: OOP, coupling and cohesion, SOLID, design patterns and clean architecture.",
    path: "/",
  });

const HERO_STATE = { phase: "hero" };

export default function Home() {
  const first = catalog[0];
  return (
    <main>
      <section className="hero wrap">
        <div className="hero-text">
          <p className="eyebrow">A free, interactive course</p>
          <h1>Software Design</h1>
          <p className="hero-lede">
            Learn how to shape code so it stays easy to understand and change. Each idea is a 3D scene you step
            through, from your first class to clean architecture.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to={`/lessons/${first.slug}`}>Start lesson 1 →</Link>
            <Link className="btn btn-lg" to="/lessons">See all 21 lessons</Link>
          </div>
        </div>
        <div className="hero-scene">
          <SceneCanvas scene="what-is-design" sceneState={HERO_STATE} label="Two versions of the same app: one tangled, one neatly organized into modules." />
        </div>
      </section>
      <section className="wrap">
        <CourseMap />
      </section>
      <section className="wrap">
        <EmailSignup />
      </section>
      <JsonLd data={courseJsonLd()} />
    </main>
  );
}
