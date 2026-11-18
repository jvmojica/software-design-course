import { Link, useLoaderData, type MetaFunction } from "react-router";
import { EmailSignup } from "~/components/EmailSignup";
import { JsonLd } from "~/components/JsonLd";
import { highlightCode } from "~/content-render/highlight";
import { renderMarkdown } from "~/content-render/markdown";
import { catalog } from "~/lessons/catalog";
import { getLessonWithContent } from "~/lessons/content.server";
import { getLesson, neighbors } from "~/lessons/registry";
import { LEVEL_LABEL, type CatalogEntry, type SceneId } from "~/lessons/types";
import { FullLessonText } from "~/player/FullLessonText";
import { LessonPlayer } from "~/player/LessonPlayer";
import type { RenderedStep } from "~/player/types";
import { SceneCanvas } from "~/scene/SceneCanvas";
import { breadcrumbJsonLd, lessonJsonLd } from "~/seo/jsonld";
import { lessonMeta } from "~/seo/meta";
import { siteConfig } from "~/site.config";

type LoaderData = {
  entry: CatalogEntry;
  scene?: SceneId;
  steps?: RenderedStep[];
  prev?: CatalogEntry;
  next?: CatalogEntry;
};

/** Runs at build time while pre-rendering: lesson markdown and code become static HTML. */
export async function loader({ params }: { params: { slug?: string } }): Promise<LoaderData> {
  const entry = params.slug ? getLesson(params.slug) : undefined;
  if (!entry) throw new Response("Not Found", { status: 404 });
  const { prev, next } = neighbors(entry.slug);
  const base: LoaderData = { entry, prev, next };
  const lesson = getLessonWithContent(entry.slug);
  if (!lesson) return base;
  const steps = await Promise.all(
    lesson.steps.map(async (s) => ({
      title: s.title,
      bodyHtml: renderMarkdown(s.body),
      codeHtml: s.code ? await highlightCode(s.code.source, s.code.highlight) : undefined,
      sceneState: s.sceneState,
    })),
  );
  return { ...base, scene: lesson.scene, steps };
}

/**
 * In the browser: only lessons in the catalog have pre-rendered data. For any other slug,
 * answer 404 right away instead of fetching a .data file that doesn't exist.
 */
export async function clientLoader({ params, serverLoader }: { params: { slug?: string }; serverLoader: () => Promise<LoaderData> }) {
  if (!params.slug || !getLesson(params.slug)) throw new Response("Not Found", { status: 404 });
  return serverLoader();
}
// No `clientLoader.hydrate`: pre-rendered pages must hydrate from their HTML so the lesson text stays in the page.

export const meta: MetaFunction<typeof loader> = ({ data }) => (data ? lessonMeta(data.entry) : [{ title: "Page not found" }]);

export default function LessonRoute() {
  const { entry, scene, steps, prev, next } = useLoaderData<LoaderData>();
  const level = LEVEL_LABEL[entry.level];

  return (
    <main className="wrap lesson-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/lessons">Course map</Link>{" › "}<span>{level}</span>{" › "}<span>{entry.number}/{catalog.length}</span>
      </nav>
      <h1 className="lesson-heading">{entry.title}</h1>

      {steps && scene ? (
        <>
          <p className="lesson-lede">{entry.summary}</p>
          <LessonPlayer
            key={entry.slug /* a new lesson always starts fresh at step 1 */}
            title={entry.title}
            steps={steps}
            renderScene={(state, i) => (
              <SceneCanvas scene={scene} sceneState={state} label={`Diagram for step ${i + 1}: ${steps[i].title}`} />
            )}
          />
          <FullLessonText steps={steps} />
          <JsonLd data={lessonJsonLd({ ...entry, scene, steps: [] })} />
        </>
      ) : (
        <section className="coming-soon">
          <span className="badge">Coming soon</span>
          <p className="lesson-lede">{entry.summary}</p>
          <p>
            This lesson is being built. <Link to="/lessons">Start with a lesson that's ready</Link>
            {siteConfig.emailFormAction ? ", or subscribe below to hear when it's published." : "."}
          </p>
        </section>
      )}

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Course map", path: "/lessons" },
          { name: entry.title, path: `/lessons/${entry.slug}` },
        ])}
      />

      <nav className="lesson-nav" aria-label="More lessons">
        {prev ? <Link to={`/lessons/${prev.slug}`} className="lesson-nav-prev">← Previous: {prev.title}</Link> : <span />}
        {next && <Link to={`/lessons/${next.slug}`} className="lesson-nav-next">Next: {next.title} →</Link>}
      </nav>

      <EmailSignup />
    </main>
  );
}
