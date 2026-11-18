import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { beforeAll, describe, expect, test, vi } from "vitest";
import type { CatalogEntry, Lesson } from "~/lessons/types";

const published: Lesson = {
  number: 2, slug: "pub", title: "Published lesson", level: "beginner", summary: "A published lesson.",
  status: "published", scene: "placeholder",
  steps: [
    { title: "Step one", body: "Hello **world**", sceneState: {} },
    { title: "Step two", body: "More", code: { lang: "ts", source: "const x = 1" }, sceneState: {} },
  ],
};
const first: CatalogEntry = { number: 1, slug: "first", title: "First", level: "beginner", summary: "s", status: "coming-soon" };
const soon: CatalogEntry = { number: 3, slug: "soon", title: "Soon lesson", level: "intermediate", summary: "Not yet.", status: "coming-soon" };

vi.mock("~/lessons/catalog", () => ({ catalog: [first, published, soon] }));
// Shiki needs Node's WASM loader (covered in tests/content-render, node env); stub it under jsdom.
vi.mock("~/content-render/highlight", () => ({ highlightCode: async (src: string) => `<pre class="shiki">${src}</pre>` }));
vi.mock("~/scene/SceneCanvas", () => ({ SceneCanvas: ({ label }: { label: string }) => <div role="img" aria-label={label} /> }));

let mod: typeof import("~/routes/lesson");
let root: typeof import("~/root");
beforeAll(async () => {
  mod = await import("~/routes/lesson");
  root = await import("~/root");
});

const renderAt = (slug: string) => {
  const Stub = createRoutesStub([
    { path: "/lessons/:slug", Component: mod.default, loader: mod.loader as never, ErrorBoundary: root.ErrorBoundary, HydrateFallback: () => null },
  ]);
  return render(<Stub initialEntries={[`/lessons/${slug}`]} />);
};

describe("lesson route", () => {
  test("published lesson renders the player, full text and breadcrumb", async () => {
    renderAt("pub");
    expect(await screen.findByRole("heading", { level: 1, name: "Published lesson" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Step two/ })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Course map › Beginner › 2/3"); // total = catalog length (fixture has 3)
    expect(screen.getByRole("link", { name: /Previous: First/ })).toHaveAttribute("href", "/lessons/first");
    expect(screen.getByRole("link", { name: /Next: Soon lesson/ })).toHaveAttribute("href", "/lessons/soon");
  });

  test("loader renders markdown and code to HTML", async () => {
    const data = await mod.loader({ params: { slug: "pub" } } as never);
    expect(data.steps?.[0].bodyHtml).toContain("<strong>world</strong>");
    expect(data.steps?.[1].codeHtml).toContain("<pre");
  });

  test("coming-soon lesson renders a stub without the player and is noindex", async () => {
    renderAt("soon");
    expect(await screen.findByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("Not yet.")).toBeInTheDocument();
    expect(screen.queryByText(/Step 1 of/)).toBeNull();
    const meta = mod.meta({ data: { entry: soon } } as never) as Record<string, unknown>[];
    expect(meta).toContainEqual({ name: "robots", content: "noindex" });
  });

  test("in the browser, an unknown slug is a 404 without fetching data that was never pre-rendered", async () => {
    let fetched = false;
    const serverLoader = async () => { fetched = true; return {}; };
    await expect(mod.clientLoader({ params: { slug: "nope" }, serverLoader } as never)).rejects.toMatchObject({ status: 404 });
    expect(fetched).toBe(false);
    await mod.clientLoader({ params: { slug: "pub" }, serverLoader } as never);
    expect(fetched).toBe(true);
  });

  test("unknown slug throws a 404 and shows Page not found", async () => {
    await expect(mod.loader({ params: { slug: "nope" } } as never)).rejects.toMatchObject({ status: 404 });
    renderAt("nope");
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /course map/i })).toHaveAttribute("href", "/lessons");
  });
});
