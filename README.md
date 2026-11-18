# Software Design — an interactive 3D course

A free, interactive course that teaches **software design**: how to shape code so it stays easy to understand and change. Each idea is an animated 3D scene you step through, with short text and a code snippet that change along with it.

21 lessons in three levels (beginner → advanced). v1 ships lessons **1, 6, 10 and 16**; the rest appear on the course map as "coming soon".

Built with React 19, React Router 7 (pre-rendered static site), Three.js via react-three-fiber, and TypeScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run typecheck
npm run build      # OG images → pre-render every page → 404 page → SEO checks
npx serve build/client   # preview the production build
```

`npm run build` fails if any page is missing its title, description, canonical URL, preview image or structured data, if a published lesson's step text is missing from the HTML, or if a coming-soon lesson is indexable.

## Configure

Everything site-specific lives in [`app/site.config.ts`](app/site.config.ts):

| Field | What it does |
|---|---|
| `siteUrl` | Absolute URL used for canonical links, the sitemap, Open Graph and structured data. Change it when you add a custom domain. |
| `author` | Shown on the About page and in structured data. |
| `emailFormAction` | The form action URL from your email provider (Buttondown, Kit…). Empty hides the signup form. |
| `supportUrl` | Ko-fi / GitHub Sponsors link. Empty hides the support link. |

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project**, import the repo. `vercel.json` already sets the build command (`npm run build`) and output directory (`build/client`).
3. After the first deploy, set `siteUrl` in `app/site.config.ts` to the real URL and redeploy.

## How it works

```
app/lessons/catalog.ts        all 21 lessons: titles, summaries, levels, status
app/lessons/content/*.ts      a built lesson's steps (markdown text, code, sceneState)
app/scene/layouts/*.ts        one pure function per lesson: sceneState → SceneModel
app/scene/SceneRenderer.tsx   draws any SceneModel in 3D and animates between steps
app/player/                   step controls, #step-N links, keyboard navigation
app/routes/lesson.tsx         loader renders markdown + code to HTML at build time
app/seo/                      meta tags, JSON-LD, sitemap, robots
scripts/                      OG image generation and the post-build SEO check
```

A scene is plain data, so every scene in every lesson is validated by unit tests without a browser. The 3D code is loaded lazily, after the page's text is on screen.

## Add a lesson

1. **Layout:** create `app/scene/layouts/<scene>.ts` exporting a `SceneLayout` (`(sceneState) => SceneModel`). Use `iso(u, v, y)` from `helpers.ts` to place things in screen terms. Register it in `app/scene/layouts/index.ts` and add its id to `SceneId` in `app/lessons/types.ts`.
2. **Content:** create `app/lessons/content/<nn>-<slug>.ts` exporting `{ scene, steps }`. Each step's text should fully describe what the scene shows: that text is what search engines and screen readers get.
3. **Publish:** add it to the `content` map in `app/lessons/catalog.ts`. That flips the lesson from "coming soon" to published, adds it to the sitemap and removes `noindex`.
4. Add `tests/lessons/content/<nn>.test.ts` with assertions about what each phase shows, then run `npm test && npm run build`.
