import type { CanvasState, Pixel } from "./types";

// Set VITE_API_URL in a .env file, e.g. VITE_API_URL=http://localhost:5000
const BASE = import.meta.env.VITE_API_URL ?? "";

export class CooldownError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`On cooldown for ${retryAfterSeconds}s`);
  }
}

/** ADAPT: change the URL / response mapping to match your backend. */
export async function getCanvas(): Promise<CanvasState> {
  const res = await fetch(`${BASE}/api/canvas`);
  if (!res.ok) throw new Error(`Failed to load canvas (${res.status})`);
  return res.json();
}

/** ADAPT: change the URL / body to match your backend. */
export async function placePixel(pixel: Pixel): Promise<void> {
  const res = await fetch(`${BASE}/api/pixels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pixel),
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? 5);
    throw new CooldownError(retryAfter);
  }
  if (!res.ok) throw new Error(`Failed to place pixel (${res.status})`);
}
