# Software Design — an interactive 3D course

Design document · 2026-11-18 · Status: draft, awaiting approval

## Intent and why

An interactive web course that teaches **software design** (how code is structured: OOP, principles, patterns, architecture — not server/infra "system design"). Each idea is an animated 3D scene the learner steps through, with short text and a code snippet that change in sync.

It serves two purposes at once:

1. **Teaching** — the owner uses it to teach others, from beginner to advanced.
2. **Portfolio** — it showcases React + Three.js skill and engineering judgment (one data-driven engine powering 21 lessons).

Inspiration: the format of https://designed-to-scale.vercel.app/ (step-through animated diagrams, calm course feel). We borrow the *format* only; all content, artwork, names and styling are original.

## Goals

- 21 lessons, 7 per level (Beginner / Intermediate / Advanced) — curriculum below.
- Every lesson is a step-through 3D scene + step text + code snippet, driven by data.
- Strong SEO: every lesson URL is pre-rendered HTML with full text, metadata and structured data.
- Free and public. Light, honest monetization hooks (email signup, support link).
- Works well on phones and desktops; keyboard-navigable.

## Non-goals (v1)

- User accounts, progress sync, payments, paywalls, backend or database.
- Quizzes, certificates, comments.
- Multiple programming languages for code samples.
- CMS — lessons are files in the repo.

## Anti-goals (failure even if it "works")

- 3D as decoration. Each scene must make an abstract idea *easier* to see than a flat diagram would. Clutter is failure.
- Lesson content that only exists inside the WebGL canvas (invisible to search engines and screen readers).
- Copying the inspiration site's content, art, names, or look.
- Slow first load — the 3D bundle must not block reading the lesson text.

## Curriculum

**Beginner — thinking in pieces**
1. What is software design?
2. Functions and naming, and breaking problems apart
3. OOP basics: classes, objects and encapsulation
4. OOP in depth: abstraction, inheritance and polymorphism
5. Separation of concerns
6. Coupling and cohesion
7. Keep it simple: DRY, KISS and YAGNI

**Intermediate — principles**
8. SOLID, part 1: Single Responsibility and Open/Closed
9. SOLID, part 2: Liskov, Interface Segregation and Dependency Inversion
10. Composition over inheritance
11. Interfaces and dependency injection
12. Designing for testability
13. Error handling and defensive design
14. Creational patterns: Factory, Builder and Singleton

**Advanced — patterns and architecture**
15. Structural patterns: Adapter, Decorator, Facade and Composite
16. Behavioral patterns: Strategy, Observer, Command and State
17. Code smells and refactoring techniques
18. Layered architecture
19. Hexagonal and clean architecture
20. Domain-driven design basics
21. Capstone: redesign a messy codebase step by step

Lesson 1 is the showcase that sets the visual style. Scene idea: the same small app built two ways side by side; a feature request arrives; one version changes a single piece, the other ripples red through everything.

## Approaches considered

| Option | Trade-off | Decision |
|---|---|---|
| **A. Vite + React SPA, data-driven lesson player** | Simplest; Three.js just works; new lesson = new data file. SEO needs pre-rendering (added below). | **Chosen** |
| B. Next.js + MDX | Best SEO out of the box, but R3F must live in client-only boundaries; heavier than needed. | Rejected |
| C. Astro + React islands | Fast and SEO-friendly, but keeping step controls, text and the 3D scene in sync across islands is awkward — and that sync is the core of every lesson. | Rejected |

The owner chose A and asked for better SEO, solved with build-time pre-rendering (React Router v7 framework mode, still on Vite).

## Decided by the owner

- Topic: software design, beginner → advanced; for teaching + portfolio.
- Stack: React + Three.js.
- 21 lessons, 7 per level, curriculum as listed (lesson 1 titled "What is software design?"; OOP explicit in lessons 3–4).
- Build approach A, plus strong SEO.
- Completely free. Monetize via email signup + support link now; paid extras (cheat sheets, ebook via Gumroad/Lemon Squeezy) later. No paywall in v1.
- Lesson page layout (sketch below) accepted "for now".
- Learners use it **on their own** (self-paced via a link). No presenter mode, speaker notes or clicker support needed.
- No domain yet. Launch on a free `*.vercel.app` address; the site URL, email-form ID and support link live in one config file (`src/site.config.ts`) so a custom domain and accounts can be added later without code changes.

## Architecture

**Stack:** Vite · React 19 · TypeScript · React Router v7 (framework mode, `ssr: false`, `prerender` all routes) · three · @react-three/fiber · @react-three/drei · Shiki (build-time code highlighting) · deployed on Vercel as static files.

**Routes**
- `/` — landing: hero scene, what the course is, start button, course map.
- `/lessons` — course map: 21 lessons grouped by level.
- `/lessons/:slug` — lesson page (21 pre-rendered pages).
- `/about` — about the author, support link, email signup.

**Lesson data model** (one file per lesson, e.g. `src/lessons/06-coupling-and-cohesion.ts`):

```ts
type Lesson = {
  slug: string; number: number; level: 'beginner' | 'intermediate' | 'advanced';
  title: string; summary: string;            // summary → meta description
  scene: SceneId;                            // which 3D scene component
  steps: Step[];
};
type Step = {
  title: string;
  body: string;                              // markdown, rendered to HTML
  code?: { lang: 'ts'; source: string; highlight?: number[] };
  sceneState: Record<string, unknown>;       // what the scene should show at this step
};
```

**Lesson player** — one shared component. It owns the current step (synced to the URL hash, `#step-3`, so steps are linkable), renders the text + code panel, the step controls (prev/next, dots, ← → keys), and passes `sceneState` to the lesson's scene component. Scenes animate between states (tweening positions, colors, connections); they never own lesson flow.

**Scene toolkit** — reusable 3D building blocks so 21 scenes stay consistent and cheap to build: `ModuleBox` (a class/module as an isometric block with a label), `Connector` (dependency arrow, can glow/ripple), `Group`/`Layer` (architecture layers), `Message` (a packet travelling between objects), plus a shared orthographic isometric camera, lighting, and the color palette. Scenes are lazy-loaded per lesson.

**Layout**

```
┌────────────────────────────────────────────────────┐
│ Software Design   Course map   Beginner ▸ 6/21     │
├──────────────────────────────┬─────────────────────┤
│                              │ Coupling & Cohesion │
│        3D SCENE              │ Step 3 of 8         │
│   (isometric, animated)      │ Text for this step… │
│                              │ ┌─────────────────┐ │
│                              │ │ code snippet    │ │
│                              │ └─────────────────┘ │
├──────────────────────────────┴─────────────────────┤
│  ◀ Prev   ● ● ● ○ ○ ○ ○ ○   Next ▶   (← → keys)    │
└────────────────────────────────────────────────────┘
```
On narrow screens: scene on top, text below.

## SEO

- Every route pre-rendered to static HTML at build time.
- Per-page `<title>`, meta description, canonical URL, Open Graph + Twitter tags, per-lesson OG image (1200×630).
- **All step text and code present in the HTML.** Pre-rendered HTML contains every step (later steps visually collapsed or shown as a "full lesson text" section), so crawlers and screen readers get the complete lesson.
- JSON-LD: `Course` on `/` and `/lessons`; `LearningResource` (part of the Course) on each lesson; `BreadcrumbList`.
- `sitemap.xml` and `robots.txt` generated at build.
- Performance: the Three.js bundle is code-split and loaded after the text renders; canvas shows a lightweight placeholder until ready. Target Lighthouse SEO 100, performance ≥ 90 on lesson pages.

## Monetization hooks (v1)

- Email signup form (embedded third-party form — no backend) on landing, lesson end, and about page.
- "Support this course" link (Ko-fi / GitHub Sponsors) in footer and about page.
- Nothing gated. Room left in the design for a future "Resources" page selling extras.

## Accessibility

- Keyboard step navigation; visible focus states.
- Each step's text fully describes what the scene shows (the scene is enhancement, not the only carrier of meaning).
- Respect `prefers-reduced-motion` (jump between states instead of animating).
- Light and dark themes via CSS tokens.

## Builder's calls (proposed, owner may override)

- **v1 release scope:** the full engine + course map listing all 21 lessons, with **4 lessons fully built** — 1 (showcase), 6, 10, 16 (one per level plus the showcase); the other 17 shown as "coming soon". Rationale: a few polished lessons beat many rough ones for both teaching and portfolio.
- **Code sample language:** TypeScript throughout (readable for beginners, matches the stack).
- **Visual style:** original warm, calm palette with soft isometric blocks; distinct from the inspiration site.
- **Email provider:** Buttondown or Kit (free tier, embeddable form).
- Exact scene designs for each lesson, copy, and step counts.
- **Unbuilt lessons:** each of the 17 "coming soon" lessons gets a short pre-rendered stub page (title, summary, level), marked `noindex` and left out of the sitemap; it is switched on when the lesson is built.
- **OG images:** generated at build time from lesson title, number and level.
- **Full lesson text in HTML:** shown as a collapsible "Read the full lesson" section below the player.
- **Theme:** the 3D scene follows light/dark theme through the same color tokens.
- Testing: unit tests for the lesson player (step logic, URL sync, keyboard); a test that every lesson file validates against the schema; a build check that every route pre-renders with title/description/JSON-LD.
