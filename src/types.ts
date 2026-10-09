export interface Pixel {
  x: number;
  y: number;
  color: string; // hex, e.g. "#ff4500"
}

export interface CanvasState {
  width: number;
  height: number;
  /** Row-major list of hex colors, length = width * height. Index = y * width + x */
  pixels: string[];
}
