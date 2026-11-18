import { expect, test } from "vitest";
import { readPalette } from "~/scene/palette";

test("readPalette reads the --scene-* CSS variables", () => {
  const el = document.createElement("div");
  const vars: Record<string, string> = {
    "--scene-neutral": "#aaaaaa", "--scene-primary": "#111111", "--scene-secondary": "#222222",
    "--scene-accent": "#333333", "--scene-danger": "#ff0000", "--scene-bg": "#fafafa",
    "--scene-ink": "#000000", "--scene-edge": "#444444",
  };
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  document.body.append(el);
  const p = readPalette(el);
  expect(p.primary).toBe("#111111");
  expect(p.danger).toBe("#ff0000");
  expect(p.edge).toBe("#444444");
  expect(p.bg).toBe("#fafafa");
});

test("readPalette falls back to defaults when a variable is missing", () => {
  const el = document.createElement("div");
  document.body.append(el);
  expect(readPalette(el).primary).toMatch(/^#[0-9a-f]{6}$/i);
});
