import type { Tone } from "./model";

export type Palette = Record<Tone | "bg" | "ink" | "edge", string>;

const DEFAULTS: Palette = {
  neutral: "#cfc6b8",
  primary: "#4a7c8c",
  secondary: "#c9a14a",
  accent: "#7a9a6b",
  danger: "#d0563f",
  bg: "#f6f1e9",
  ink: "#2b2724",
  edge: "#8a8075",
};

/** Reads the --scene-* color tokens (see app/styles/tokens.css) so the 3D scene follows the theme. */
export function readPalette(el: HTMLElement): Palette {
  const style = getComputedStyle(el);
  const out = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof Palette)[]) {
    const v = style.getPropertyValue(`--scene-${key}`).trim();
    if (v) out[key] = v;
  }
  return out;
}
