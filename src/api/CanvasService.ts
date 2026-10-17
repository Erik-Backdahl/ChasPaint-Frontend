import type { CanvasState, Pixel } from "../types";

// Falls back to "" so requests go to /api/... on the same origin (the Vite proxy)
export const BASE = import.meta.env.VITE_API_URL ?? "";

export const CANVAS_WIDTH = 250;
export const CANVAS_HEIGHT = 250;
const EMPTY_COLOR = "#ffffff";

/** Mirrors the C# PointDTO. ASP.NET Core sends property names in camelCase. */
interface PointDTO {
  xCoordinate: number;
  yCoordinate: number;
  colorHex: string | null;
  owner: unknown | null;
}

export class CooldownError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`On cooldown for ${retryAfterSeconds}s`);
  }
}

/** Accepts "ff0000" or "#ff0000"; null/empty becomes white. */
function normalizeHex(hex: string | null | undefined): string {
  if (!hex) return EMPTY_COLOR;
  return hex.startsWith("#") ? hex : `#${hex}`;
}

export async function getCanvas(): Promise<CanvasState> {
  const query = new URLSearchParams({
    minX: "0",
    maxX: String(CANVAS_WIDTH - 1),
    minY: "0",
    maxY: String(CANVAS_HEIGHT - 1),
  });

  const res = await fetch(`${BASE}/api/Canvas/points?${query}`);
  if (!res.ok) throw new Error(`Failed to load canvas (${res.status})`);
  const points: PointDTO[] = await res.json();

  const pixels = new Array<string>(CANVAS_WIDTH * CANVAS_HEIGHT).fill(EMPTY_COLOR);
  for (const p of points) {
    const x = p.xCoordinate;
    const y = p.yCoordinate;
    if (x < 0 || y < 0 || x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT) continue;
    pixels[y * CANVAS_WIDTH + x] = normalizeHex(p.colorHex);
  }

  return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, pixels };
}

export async function placePixel(pixel: Pixel): Promise<void> {
  const res = await fetch(`${BASE}/api/Canvas/update`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      xCoordinate: pixel.x,
      yCoordinate: pixel.y,
      colorHex: pixel.color,
    }),
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? 5);
    throw new CooldownError(retryAfter);
  }
  if (!res.ok) throw new Error(`Failed to place pixel (${res.status})`);
}