# Software Design Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, SEO-friendly interactive course site that teaches software design through step-through 3D scenes. v1 ships the engine, a course map of all 21 lessons, and 4 fully built lessons (1, 6, 10, 16).

**Architecture:** React Router v7 in framework mode on Vite, with `ssr: false` and every route pre-rendered to static HTML at build time. Route loaders run during pre-rendering, so they turn lesson markdown and code into HTML there. Each lesson is a data file. One shared `LessonPlayer` handles steps, URL hash and keyboard. Each lesson's 3D scene is a **pure layout function** `(sceneState) → SceneModel` (nodes, edges, layers, messages). A single generic `SceneRenderer` built on react-three-fiber draws any `SceneModel` and tweens between models by id. Scenes are therefore testable without WebGL, and adding a lesson means adding data plus one pure function.

**Tech Stack:** TypeScript 5, React 19, React Router 7 (`@react-router/dev`), Vite 6, three, @react-three/fiber 9, @react-three/drei 10, marked (markdown), Shiki 3 (code highlighting), satori + @resvg/resvg-js (OG images), Vitest 3 + @testing-library/react + jsdom, deployed as static files on Vercel.

**Spec:** `docs/superpowers/specs/2026-11-18-software-design-course-design.md`

**Deviation from spec:** the spec puts files under `src/`. React Router framework mode uses `app/`, so `src/lessons` → `app/lessons` and `src/site.config.ts` → `app/site.config.ts`.

## Global Constraints

- Topic is **software design** (code structure), not system design. All content, art, names and styling are original. Nothing copied from designed-to-scale.vercel.app, and no "designed-to-…" naming.
- 21 lessons, 7 per level, with titles exactly as listed in the spec's Curriculum section.
- v1 fully builds lessons **1, 6, 10, 16**. The other 17 are "coming soon" stub pages: `noindex`, left out of the sitemap.
- Free and public. No accounts, payments, backend or database.
- All step text and code must be present in the pre-rendered HTML (not only in the canvas).
- Code samples: TypeScript only.
- `site.config.ts` holds `siteUrl` (default `https://learn-software-design.vercel.app`), `emailFormAction`, `supportUrl`, `author`. No other file hard-codes these.
- Light and dark themes through CSS custom properties. The 3D scene reads the same tokens.
- Respect `prefers-reduced-motion`: jump between scene states, no tweening.
- Phone width (≥ 360px): no horizontal scroll. Scene sits above the text.
- The Three.js bundle is code-split and never blocks the lesson text from rendering.
- Targets: Lighthouse SEO 100, performance ≥ 90 on lesson pages.

## Review Focus

1. **Bad step hash** (`#step-0`, `#step-99`, `#step-abc`) → clamps to a valid step and does not crash. *(Task 4 test)*
2. **Arrow keys while typing in the email field** → must not change steps. *(Task 4 test)*
3. **WebGL unavailable, or the scene chunk fails to load** → the lesson stays fully readable and a calm fallback message replaces the canvas. *(Task 6 test)*
4. **Unknown lesson slug** (`/lessons/nope`) → the 404 page, not a blank screen. Visiting a coming-soon slug → stub page, not a 404. *(Task 7 test)*
5. **A scene layout that references a missing node** (an edge `from`/`to` that doesn't exist, or a duplicate id) → caught by tests for every lesson, not at runtime. *(Task 5 test, applied to every lesson in Tasks 9–12)*

---

## File Structure

```
app/
  site.config.ts                 site URL, email form, support link, author
  root.tsx                       html shell, theme tokens, header/footer, error boundary (404)
  routes.ts                      route table
  styles/tokens.css              color/spacing tokens, light + dark
  styles/global.css              base styles, layout
  lessons/
    types.ts                     Lesson, Step, Level, LessonStatus
    catalog.ts                   all 21 lesson entries (metadata + status)
    registry.ts                  getLesson, lessonsByLevel, neighbors, publishedLessons
    validate.ts                  validateLesson
    content/01-what-is-software-design.ts
    content/06-coupling-and-cohesion.ts
    content/10-composition-over-inheritance.ts
    content/16-behavioral-patterns.ts
  content-render/
    markdown.ts                  renderMarkdown
    highlight.ts                 highlightCode (Shiki)
  seo/
    meta.ts                      lessonMeta, pageMeta
    jsonld.ts                    courseJsonLd, lessonJsonLd, breadcrumbJsonLd
    sitemap.ts                   buildSitemap, buildRobots
  player/
    useStepNav.ts                step state + hash sync + keyboard
    LessonPlayer.tsx             layout: scene + step panel + controls
    StepPanel.tsx, StepControls.tsx, FullLessonText.tsx
  scene/
    model.ts                     SceneModel types + validateSceneModel
    tween.ts                     interpolateModel
    palette.ts                   readPalette (CSS tokens → three colors)
    SceneCanvas.tsx              lazy boundary, placeholder, WebGL fallback
    SceneRenderer.tsx            draws a SceneModel (client-only chunk)
    primitives/ModuleBox.tsx, Connector.tsx, LayerSlab.tsx, MessageDot.tsx
    layouts/index.ts             SceneId → layout function map
    layouts/<scene>.ts           one pure layout per lesson
  components/
    Header.tsx, Footer.tsx, EmailSignup.tsx, SupportLink.tsx, LessonCard.tsx
  routes/
    home.tsx, lessons-index.tsx, lesson.tsx, about.tsx
    sitemap[.]xml.ts, robots[.]txt.ts
scripts/
  og-images.ts                   generates public/og/*.png
  check-prerender.ts             verifies build output
tests/                           mirrors app/ (e.g. tests/lessons/registry.test.ts)
react-router.config.ts, vite.config.ts, vitest.config.ts, tsconfig.json, package.json
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `react-router.config.ts`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `.gitignore`, `app/root.tsx`, `app/routes.ts`, `app/routes/home.tsx`, `app/site.config.ts`
- Test: `tests/smoke.test.tsx`

**Interfaces:**
- Produces: `siteConfig: { siteUrl: string; siteName: 'Software Design'; author: string; emailFormAction: string; supportUrl: string }` exported from `app/site.config.ts`. Scripts: `dev`, `build`, `test`, `typecheck`, `og`, `check`.

- [ ] **Step 1:** Run `git init`. Scaffold with `npx create-react-router@latest .` (TypeScript), then strip the demo content. Add the dependencies from Tech Stack. Set `react-router.config.ts` to `{ ssr: false, prerender: ['/'] }` for now (Task 7 widens it).
- [ ] **Step 2: Write the failing test** `tests/smoke.test.tsx`: renders `home.tsx`'s default export inside `createRoutesStub` and asserts `screen.getByRole('heading', { level: 1 })` has text `Software Design`.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL (no heading).
- [ ] **Step 4:** Add an `<h1>Software Design</h1>` placeholder to `home.tsx`. Create `site.config.ts` with the defaults from Global Constraints (`emailFormAction: ''` and `supportUrl: ''` are placeholders).
- [ ] **Step 5:** Run `npm test && npm run typecheck && npm run build`. Expected: PASS, and `build/client/index.html` exists and contains `Software Design`.
- [ ] **Step 6:** Commit `chore: scaffold React Router + Vite project`.

### Task 2: Lesson model, catalog, registry and validation

**Files:**
- Create: `app/lessons/types.ts`, `app/lessons/catalog.ts`, `app/lessons/registry.ts`, `app/lessons/validate.ts`
- Test: `tests/lessons/registry.test.ts`, `tests/lessons/validate.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type Level = 'beginner' | 'intermediate' | 'advanced';
  type LessonStatus = 'published' | 'coming-soon';
  type CatalogEntry = { number: number; slug: string; title: string; level: Level; summary: string; status: LessonStatus };
  type Step = { title: string; body: string; code?: { lang: 'ts'; source: string; highlight?: number[] }; sceneState: Record<string, unknown> };
  type SceneId = 'placeholder' | 'what-is-design' | 'coupling-cohesion' | 'composition' | 'behavioral-patterns';
  type Lesson = CatalogEntry & { scene: SceneId; steps: Step[] };
  getLesson(slug: string): Lesson | CatalogEntry | undefined
  isPublished(x: Lesson | CatalogEntry): x is Lesson
  lessonsByLevel(): Record<Level, CatalogEntry[]>
  neighbors(slug: string): { prev?: CatalogEntry; next?: CatalogEntry }   // by number, across levels
  publishedLessons(): Lesson[]
  validateLesson(l: Lesson): string[]        // empty = valid
  ```
  Until Tasks 9–12 add content, all 21 entries are `coming-soon`.

- [ ] **Step 1: Write failing tests.** `registry.test.ts`: catalog has 21 entries; numbers are 1..21 with no gaps; slugs are unique and kebab-case (`/^[a-z0-9]+(-[a-z0-9]+)*$/`); 7 per level, in order (1–7 beginner, 8–14 intermediate, 15–21 advanced); titles match the spec exactly (assert lesson 1 is `What is software design?`, 4 is `OOP in depth: abstraction, inheritance and polymorphism`, 21 is `Capstone: redesign a messy codebase step by step`); `neighbors('<lesson 7 slug>').next.number === 8`; lesson 1 has no `prev`. `validate.test.ts`: a lesson with 0 steps, an empty step title, or a `summary` longer than 160 chars each returns a non-empty error list; a minimal valid lesson returns `[]`.
- [ ] **Step 2:** Run `npx vitest run tests/lessons`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement. Copy the 21 titles verbatim from the spec. Write a one-sentence summary (≤ 160 chars) for each lesson; it becomes the meta description.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit `feat: lesson model, catalog of 21 lessons, registry`.

### Task 3: Build-time content rendering and SEO helpers

**Files:**
- Create: `app/content-render/markdown.ts`, `app/content-render/highlight.ts`, `app/seo/meta.ts`, `app/seo/jsonld.ts`, `app/seo/sitemap.ts`
- Test: `tests/content-render/render.test.ts`, `tests/seo/seo.test.ts`

**Interfaces:**
- Consumes: `siteConfig`, `CatalogEntry`, `Lesson`, `publishedLessons()`.
- Produces:
  ```ts
  renderMarkdown(md: string): string                                   // HTML; raw HTML in input is escaped
  highlightCode(source: string, highlight?: number[]): Promise<string> // Shiki, themes 'github-light' + 'github-dark' as dual themes via CSS vars
  lessonMeta(entry: CatalogEntry): MetaDescriptor[]                    // title, description, canonical, og:*, twitter:*, robots noindex if coming-soon
  pageMeta(p: { title: string; description: string; path: string }): MetaDescriptor[]
  courseJsonLd(): object; lessonJsonLd(l: Lesson): object; breadcrumbJsonLd(items: { name: string; path: string }[]): object
  buildSitemap(): string; buildRobots(): string
  ```

- [ ] **Step 1: Write failing tests.** `renderMarkdown('**a** <script>x</script>')` contains `<strong>a</strong>` and does not contain `<script>`. `highlightCode('const a = 1')` contains `<pre` and `--shiki-dark`. `lessonMeta(published)` includes `{ title: '<Title> · Software Design' }`, a `canonical` link equal to `${siteUrl}/lessons/<slug>`, and `og:image` equal to `${siteUrl}/og/<slug>.png`. `lessonMeta(comingSoon)` includes `{ name: 'robots', content: 'noindex' }`. `lessonJsonLd` has `@type: 'LearningResource'`, `isPartOf['@type'] === 'Course'`, and `educationalLevel` set to the level. `buildSitemap()` contains `/`, `/lessons`, `/about` and each published slug, and contains **no** coming-soon slug (assert with a known coming-soon slug). `buildRobots()` contains `Sitemap: ${siteUrl}/sitemap.xml`.
- [ ] **Step 2:** Run `npx vitest run tests/content-render tests/seo`. Expected: FAIL.
- [ ] **Step 3:** Implement. Create the Shiki highlighter once and reuse it (module-level promise). `highlight` lines get a `data-highlighted` attribute through a Shiki transformer.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit `feat: build-time markdown, highlighting and SEO helpers`.

### Task 4: Lesson player (steps, hash, keyboard, panels)

**Files:**
- Create: `app/player/useStepNav.ts`, `app/player/LessonPlayer.tsx`, `app/player/StepPanel.tsx`, `app/player/StepControls.tsx`, `app/player/FullLessonText.tsx`
- Test: `tests/player/useStepNav.test.tsx`, `tests/player/LessonPlayer.test.tsx`

**Interfaces:**
- Consumes: `Step` and `Lesson` types. The rendered step is a `RenderedStep = { title: string; bodyHtml: string; codeHtml?: string; sceneState: Record<string, unknown> }` produced by the route loader (Task 7).
- Produces:
  ```ts
  useStepNav(count: number): { index: number; go(i: number): void; next(): void; prev(): void }
  <LessonPlayer title={string} steps={RenderedStep[]} renderScene={(sceneState, index) => ReactNode} />
  <FullLessonText steps={RenderedStep[]} />   // <details> "Read the full lesson", every step as <section><h2>…
  ```

- [ ] **Step 1: Write failing tests.** `useStepNav`: starts at 0; `next()` at the last step stays at the last; `prev()` at 0 stays at 0; after `go(2)`, `location.hash === '#step-3'` (steps are 1-based in the URL, using `history.replaceState`); initial hash `#step-3` → index 2; **`#step-0`, `#step-99` and `#step-abc` → index clamped to 0 / count-1 / 0** (Review Focus 1); ArrowRight/ArrowLeft and PageDown/PageUp on `window` move steps; **ArrowRight dispatched with an `<input>` focused does not move steps** (Review Focus 2). `LessonPlayer`: renders `Step 1 of N`; clicking `Next` shows step 2's title; the dot buttons have `aria-label="Go to step k"` and `aria-current="step"` on the active one; step text sits in an `aria-live="polite"` region; `FullLessonText` renders every step's title (count all N `h2`s even while the player shows step 1).
- [ ] **Step 2:** Run `npx vitest run tests/player`. Expected: FAIL.
- [ ] **Step 3:** Implement. Inject `bodyHtml`/`codeHtml` with `dangerouslySetInnerHTML`; they are trusted, generated at build time from repo content. Layout uses CSS grid: two columns ≥ 900px (scene ~60%), one column below it.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit `feat: lesson player with hash sync and keyboard nav`.

### Task 5: Scene model, validation and tweening (pure, no WebGL)

**Files:**
- Create: `app/scene/model.ts`, `app/scene/tween.ts`, `app/scene/layouts/index.ts`, `app/scene/layouts/placeholder.ts`
- Test: `tests/scene/model.test.ts`, `tests/scene/tween.test.ts`, `tests/scene/all-layouts.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type Tone = 'neutral' | 'primary' | 'secondary' | 'accent' | 'danger';
  type Emphasis = 'normal' | 'dim' | 'highlight' | 'alert';
  type Vec3 = [number, number, number];          // grid units; y is up
  type NodeSpec = { id: string; label: string; position: Vec3; size?: Vec3; tone: Tone; emphasis?: Emphasis; shape?: 'box' | 'sphere' | 'cylinder'; opacity?: number /* 0..1, default 1 */ };
  type EdgeSpec = { id: string; from: string; to: string; style?: 'solid' | 'dashed'; state?: 'normal' | 'active' | 'alert' };
  type LayerSpec = { id: string; label: string; y: number; tone: Tone };
  type MessageSpec = { id: string; from: string; to: string; label?: string };   // renderer loops a dot along from→to
  type SceneModel = { nodes: NodeSpec[]; edges: EdgeSpec[]; layers?: LayerSpec[]; messages?: MessageSpec[]; camera?: { zoom: number; target: Vec3 } };
  type SceneLayout = (state: Record<string, unknown>) => SceneModel;
  // SceneId is imported from app/lessons/types.ts (Task 2)
  const sceneLayouts: Record<SceneId, SceneLayout>;
  validateSceneModel(m: SceneModel): string[];
  interpolateModel(from: SceneModel, to: SceneModel, t: number): SceneModel;   // t in [0,1]
  ```
  Add the four lesson layout entries in Tasks 9–12. Until then, map them to `placeholder`.

- [ ] **Step 1: Write failing tests.** `validateSceneModel` flags: duplicate ids across nodes/edges/layers/messages; an edge or message whose `from`/`to` is not a node id; a non-finite position (**Review Focus 5**). `interpolateModel`: at t=0 it equals `from`, at t=1 it equals `to`, at t=0.5 a node present in both has its position at the midpoint; a node only in `to` fades in (opacity t); a node only in `from` fades out (opacity 1−t) and is removed at t=1. `all-layouts.test.ts`: for **every published lesson** (from `publishedLessons()`) and **every step**, `validateSceneModel(sceneLayouts[lesson.scene](step.sceneState))` returns `[]`. This test automatically covers Tasks 9–12.
- [ ] **Step 2:** Run `npx vitest run tests/scene`. Expected: FAIL.
- [ ] **Step 3:** Implement. Matching is by id. Positions are interpolated linearly; colors are interpolated in the renderer, not here.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit `feat: pure scene model, validation and tweening`.

### Task 6: Scene renderer, primitives, theme palette and lazy canvas

**Files:**
- Create: `app/scene/palette.ts`, `app/scene/SceneCanvas.tsx`, `app/scene/SceneRenderer.tsx`, `app/scene/primitives/ModuleBox.tsx`, `Connector.tsx`, `LayerSlab.tsx`, `MessageDot.tsx`, `app/styles/tokens.css`
- Test: `tests/scene/SceneCanvas.test.tsx`, `tests/scene/palette.test.ts`

**Interfaces:**
- Consumes: `SceneModel`, `interpolateModel`, `sceneLayouts`, `SceneId`.
- Produces:
  ```ts
  <SceneCanvas scene={SceneId} sceneState={Record<string, unknown>} label={string} />
     // label → aria-label on the canvas wrapper (role="img"); text describing the current step
  readPalette(el: HTMLElement): Record<Tone | 'bg' | 'ink' | 'edge', string>   // reads --scene-* CSS vars
  ```

- [ ] **Step 1: Write failing tests.** `SceneCanvas` under jsdom (no WebGL): renders a placeholder with `role="img"` and the given `aria-label` on first paint (this is also what pre-rendered HTML contains); when the `isWebGLAvailable()` helper returns false (mock it) → shows the text `The 3D diagram can't be shown on this device — the lesson text below covers everything.`; when the lazy `SceneRenderer` import rejects (mock it) → shows the same fallback, and the error is caught by a local error boundary, not by the route (**Review Focus 3**). `readPalette` returns the values of `--scene-primary`, etc., set on a test element.
- [ ] **Step 2:** Run `npx vitest run tests/scene/SceneCanvas.test.tsx tests/scene/palette.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement.
  - `SceneCanvas` loads `SceneRenderer` with `React.lazy` inside `Suspense` and only mounts it on the client, after hydration (a `useEffect` flag).
  - `SceneRenderer` is a R3F `<Canvas orthographic>` with an isometric camera: position along (1, 1, 1) normalized × 20, looking at `camera.target`, zoom from the model (default 60). It uses soft ambient + directional light and transparent clear, so the page background shows through.
  - On each new `SceneModel`, it tweens `interpolateModel(prev, next, t)` over 600 ms with ease-in-out in `useFrame`. With `prefers-reduced-motion` it jumps straight to `next`.
  - Primitives: `ModuleBox` is drei `RoundedBox` + drei `Text` label (always faces the camera; `emphasis` maps to opacity/outline/color: `alert` uses `danger` tone and a gentle pulse); `Connector` is drei `Line` with an arrowhead cone (`dashed` → dashed; `alert` → danger color); `LayerSlab` is a thin wide box with a label at its left edge; `MessageDot` is a small sphere looping from→to over 1.2 s.
  - Re-read the palette when `prefers-color-scheme` or `data-theme` changes.
  - `tokens.css` defines the original warm palette for light and dark (`--bg`, `--ink`, `--muted`, `--scene-neutral|primary|secondary|accent|danger|edge`), with dark overrides under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`.
- [ ] **Step 4:** Run the tests. Expected: PASS. Then run `npm run dev`, render the placeholder layout on a temporary route, and check by eye that boxes, an edge, a layer and a moving message appear, and that switching theme recolors them. Delete the temporary route afterwards.
- [ ] **Step 5:** Commit `feat: R3F scene renderer, primitives and lazy canvas`.

### Task 7: Routes, layout shell, monetization hooks and full pre-rendering

**Files:**
- Create: `app/routes/lessons-index.tsx`, `app/routes/lesson.tsx`, `app/routes/about.tsx`, `app/routes/sitemap[.]xml.ts`, `app/routes/robots[.]txt.ts`, `app/components/Header.tsx`, `Footer.tsx`, `EmailSignup.tsx`, `SupportLink.tsx`, `LessonCard.tsx`, `app/styles/global.css`
- Modify: `app/routes.ts`, `app/root.tsx`, `app/routes/home.tsx`, `react-router.config.ts`
- Test: `tests/routes/lesson.test.tsx`, `tests/routes/pages.test.tsx`

**Interfaces:**
- Consumes: everything above.
- Produces: the `lesson.tsx` loader returns `{ entry: CatalogEntry; steps?: RenderedStep[]; prev?: CatalogEntry; next?: CatalogEntry }` and throws a 404 `Response` for unknown slugs. `prerender()` returns `['/', '/lessons', '/about', '/sitemap.xml', '/robots.txt', ...all 21 '/lessons/<slug>']`.

- [ ] **Step 1: Write failing tests** with `createRoutesStub` and calling the loaders directly. Published lesson → `LessonPlayer` + `FullLessonText` render, the breadcrumb shows `Course map › <Level> › <n>/21`, and the prev/next links are correct. Coming-soon lesson → page shows title, summary, level and `Coming soon`, with no player, and its `meta` includes robots noindex. **Unknown slug → the loader throws a 404 and the root `ErrorBoundary` renders `Page not found` with a link to the course map** (Review Focus 4). `/lessons` lists 21 `LessonCard`s under three `h2`s (`Beginner`, `Intermediate`, `Advanced`), with coming-soon cards visibly labeled. `EmailSignup` renders nothing when `siteConfig.emailFormAction` is empty, and a `<form method="post" action=…>` with an email input when it's set. `SupportLink` likewise depends on `supportUrl`.
- [ ] **Step 2:** Run `npx vitest run tests/routes`. Expected: FAIL.
- [ ] **Step 3:** Implement.
  - The loader maps each step through `renderMarkdown`/`highlightCode` to produce `RenderedStep`.
  - Each route exports `meta` (`lessonMeta`/`pageMeta`) and renders its JSON-LD as `<script type="application/ld+json">`: Course on `/` and `/lessons`, LearningResource + Breadcrumb on lessons.
  - Home: h1, one-paragraph pitch, Start button → lesson 1, course map, `EmailSignup`.
  - About: author, why the course exists, `SupportLink`, `EmailSignup`.
  - The footer has the support link and a theme toggle (sets `data-theme` on `<html>`, remembered in `localStorage` inside try/catch).
  - Published lessons end with `EmailSignup` below `FullLessonText`.
  - Set `prerender()` in `react-router.config.ts` from the catalog.
- [ ] **Step 4:** Run `npm test && npm run build`. Expected: PASS. `build/client/lessons/<each of 21 slugs>/index.html`, `build/client/sitemap.xml` and `build/client/robots.txt` exist.
- [ ] **Step 5:** Commit `feat: routes, pre-rendering, layout and signup/support hooks`.

### Task 8: OG images and the build verification script

**Files:**
- Create: `scripts/og-images.ts`, `scripts/check-prerender.ts`, `public/fonts/` (one open-license font, e.g. Inter or Atkinson Hyperlegible TTF)
- Modify: `package.json` (`"build": "tsx scripts/og-images.ts && react-router build && tsx scripts/check-prerender.ts"`)
- Test: `tests/scripts/og.test.ts`

**Interfaces:**
- Produces: `renderOgImage(entry: CatalogEntry): Promise<Buffer>` (PNG, 1200×630) in `scripts/og-images.ts`; `public/og/<slug>.png` for every catalog entry plus `public/og/default.png`. `checkPrerender(buildDir: string): string[]` (empty = ok) in `scripts/check-prerender.ts`.

- [ ] **Step 1: Write failing tests.** `renderOgImage(lesson1)` returns a Buffer that starts with the PNG signature, and its IHDR width/height read as 1200×630. `checkPrerender` on a fixture dir (`tests/fixtures/build-bad/`, containing a lesson HTML without `<meta name="description">`) returns an error naming that file.
- [ ] **Step 2:** Run `npx vitest run tests/scripts`. Expected: FAIL.
- [ ] **Step 3:** Implement. The OG design: site name, level badge, `Lesson n of 21`, lesson title in large type, on the warm token background (satori → resvg). `checkPrerender` asserts, for every `lessons/*/index.html`: one `<title>`, a meta description, a canonical link, an `og:image`, and at least one `application/ld+json`. Published lessons must contain every step title from the catalog content in the HTML body. Coming-soon lessons must have robots noindex. `sitemap.xml` must not list any coming-soon slug.
- [ ] **Step 4:** Run `npm test && npm run build`. Expected: PASS, with the build ending in `check-prerender: 25 pages OK` (or the actual page count).
- [ ] **Step 5:** Commit `feat: generated OG images and pre-render verification`.

### Tasks 9–12: The four v1 lessons

Each lesson task follows the same shape:

**Files:** `app/lessons/content/<nn>-<slug>.ts` (exports a `Lesson`), `app/scene/layouts/<scene>.ts` (exports a `SceneLayout`), plus a modification to `app/lessons/catalog.ts` (set `status: 'published'`, attach `scene` and `steps`) and to `app/scene/layouts/index.ts` (register the layout).
**Test:** `tests/lessons/content/<nn>.test.ts`, plus the existing `all-layouts.test.ts` and `check-prerender`.

- [ ] **Step 1: Write failing test** `<nn>.test.ts`: `validateLesson(lesson)` is `[]`; the step count is in the range given below; the specific scene assertions listed for that lesson hold (pure calls to the layout function).
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Write the layout function and the lesson data: step titles, body copy (2–4 short paragraphs per step at most, plain language, aimed at the lesson's level), TypeScript snippets, and `sceneState` per step. Each step's body must describe what the scene shows, so the text stands alone (accessibility + SEO).
- [ ] **Step 4:** Run `npm test && npm run build`. Expected: PASS. Then open the lesson in `npm run dev` and step through it on desktop and at 375px wide, in light and dark themes.
- [ ] **Step 5:** Commit `feat: lesson <nn> — <title>`.

#### Task 9: Lesson 1 — What is software design? (showcase; build first, it sets the visual style)
Scene `what-is-design`, 7–9 steps. Story: a tiny "to-do app" exists as two versions side by side. Left is a tangle: one big block, or many blocks wired to each other. Right is well designed: UI → Logic → Storage modules with few edges. A feature request ("add due dates") arrives as a `MessageSpec`. On the right one module highlights. On the left the change ripples and many nodes turn `alert`. The lesson ends on the definition: design = shaping code so it is easy to understand and change.
Scene assertions: a `sceneState` like `{ phase: 'ripple' }` puts ≥ 4 left-side nodes in `alert` and exactly 1 right-side node in `highlight`; at `{ phase: 'intro' }` no node is `alert`.

#### Task 10: Lesson 6 — Coupling and cohesion
Scene `coupling-cohesion`, 6–8 steps. Story: about 9 functions are scattered across 3 modules with many cross-module edges (high coupling, low cohesion). Step by step, related functions move into their own module and the cross edges disappear. The final step shows the edge counts before and after.
Scene assertions: the number of cross-module edges in the first step's state is greater than in the last step's; in the last step, every node sits inside the bounds of the module it belongs to.

#### Task 11: Lesson 10 — Composition over inheritance
Scene `composition`, 6–8 steps. Story: an inheritance tree (`Animal → Bird → FlyingBird`, `Penguin`…) grows awkward when `Duck` needs both swim and fly. Then the tree is replaced by small capability blocks (`CanFly`, `CanSwim`) that snap onto objects.
Scene assertions: the inheritance phase has edges with `style: 'solid'` forming a tree (each node has ≤ 1 parent); the composition phase has no tree edges, and `Duck` has edges to both `CanFly` and `CanSwim`.

#### Task 12: Lesson 16 — Behavioral patterns: Strategy, Observer, Command and State
Scene `behavioral-patterns`, 8–12 steps (about 2–3 per pattern). Strategy: a `Checkout` node swaps between `CardPayment` and `PayPalPayment` blocks. Observer: a `Store` sends messages out to 3 subscribers. Command: button presses become command blocks in a queue that can be undone. State: a `TrafficLight` moves between state nodes.
Scene assertions: in the observer steps, `messages` contains one message from the subject to each of the 3 observers; in the strategy steps, exactly one strategy node has `emphasis: 'highlight'` and it changes between the two strategy steps.

### Task 13: Launch readiness

**Files:**
- Create: `README.md` (what the project is, how to run, test, build and deploy, how to add a lesson: data file + layout function + flip status), `vercel.json` only if needed for clean URLs (`"cleanUrls": true`, `"trailingSlash": false`)
- Modify: none expected

- [ ] **Step 1:** Run `npm run build && npx serve build/client`. Run Lighthouse (Chrome DevTools, mobile) on `/` and `/lessons/<lesson 1 slug>`. Expected: SEO 100, Accessibility ≥ 95, Performance ≥ 90. Fix regressions, usually by checking that the scene chunk is lazy and the font is preloaded.
- [ ] **Step 2:** Check that the Rich Results Test (or `npx structured-data-testing-tool`, if available) parses the Course and LearningResource JSON-LD from a built lesson file without errors.
- [ ] **Step 3:** Write the README.
- [ ] **Step 4: Owner action (not automatable):** the owner creates a Vercel project from the repo (framework preset: React Router; output `build/client`), and later fills in `emailFormAction`, `supportUrl` and, if bought, the custom domain in `app/site.config.ts`.
- [ ] **Step 5:** Commit `docs: README and launch checklist`.
