import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const FALLBACK = "The 3D diagram can't be shown on this device — the lesson text below covers everything.";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("~/scene/webgl");
  vi.doUnmock("~/scene/SceneRenderer");
});

test("first paint is an accessible placeholder with the step description", async () => {
  vi.doMock("~/scene/webgl", () => ({ isWebGLAvailable: () => true }));
  vi.doMock("~/scene/SceneRenderer", () => new Promise(() => {})); // never resolves
  const { SceneCanvas } = await import("~/scene/SceneCanvas");
  render(<SceneCanvas scene="placeholder" sceneState={{}} label="Two modules linked by an arrow" />);
  expect(screen.getByRole("img", { name: "Two modules linked by an arrow" })).toBeInTheDocument();
});

test("without WebGL a calm fallback message replaces the canvas", async () => {
  vi.doMock("~/scene/webgl", () => ({ isWebGLAvailable: () => false }));
  const { SceneCanvas } = await import("~/scene/SceneCanvas");
  render(<SceneCanvas scene="placeholder" sceneState={{}} label="x" />);
  expect(await screen.findByText(FALLBACK)).toBeInTheDocument();
});

test("if the 3D code fails to load, the fallback shows and the page survives", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.doMock("~/scene/webgl", () => ({ isWebGLAvailable: () => true }));
  vi.doMock("~/scene/SceneRenderer", () => {
    throw new Error("chunk failed");
  });
  const { SceneCanvas } = await import("~/scene/SceneCanvas");
  render(
    <main>
      <SceneCanvas scene="placeholder" sceneState={{}} label="x" />
      <p>lesson text</p>
    </main>,
  );
  expect(await screen.findByText(FALLBACK)).toBeInTheDocument();
  expect(screen.getByText("lesson text")).toBeInTheDocument();
});
