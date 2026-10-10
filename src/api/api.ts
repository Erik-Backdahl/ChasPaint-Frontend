import type { CanvasState, Pixel } from "../types";

export const BASE = import.meta.env.VITE_API_URL;





export class CooldownError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`On cooldown for ${retryAfterSeconds}s`);
  }
}

export async function getCanvas(): Promise<CanvasState> {
  const res = await fetch(`${BASE}/api/Canvas/points`);
  if (!res.ok) throw new Error(`Failed to load canvas (${res.status})`);
  return res.json();
}

export async function placePixel(pixel: Pixel): Promise<void> {
  const res = await fetch(`${BASE}/api/Canvas/update`, {
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
