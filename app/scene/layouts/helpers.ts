import type { Vec3 } from "../model";

const K = Math.SQRT1_2;

/**
 * Place things in screen terms. With the isometric camera looking from (1, 1, 1):
 * `u` moves left/right on screen, `v` moves toward/away from the viewer, `y` is height.
 * One unit of `u` is one world unit of horizontal screen distance.
 */
export function iso(u: number, v: number, y = 0): Vec3 {
  return [K * (u + v), y, K * (v - u)];
}

/** The world (x, z) center for a slab placed with `iso`. */
export function isoCenter(u: number, v: number): [number, number] {
  const [x, , z] = iso(u, v);
  return [x, z];
}

/** Reads a string field from sceneState with a fallback, so bad data never crashes a scene. */
export function pick<T extends string>(state: Record<string, unknown>, key: string, allowed: readonly T[], fallback: T): T {
  const v = state[key];
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
