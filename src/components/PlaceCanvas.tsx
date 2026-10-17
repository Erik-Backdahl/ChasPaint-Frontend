import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  width: number;
  height: number;
  pixels: string[];
  selectedColor: string;
  disabled?: boolean;
  onPlace: (x: number, y: number) => void;
  onHover?: (pos: { x: number; y: number } | null) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 50;
const DRAG_THRESHOLD = 4; // px moved before a click counts as a drag

const rgbCache = new Map<string, [number, number, number]>(); //converts the hexcode to a rgb value also works with short hex codes
function hexToRgb(hex: string): [number, number, number] {
  let rgb = rgbCache.get(hex); // looks if the color already is in the cache
  if (!rgb) {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, rgb);
  }
  return rgb;
}

export default function PlaceCanvas({
  width,
  height,
  pixels,
  selectedColor,
  disabled,
  onPlace,
  onHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  // Draw all pixels to the canvas (1 canvas pixel = 1 grid cell)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(width, height);
    for (let i = 0; i < width * height; i++) {
      const [r, g, b] = hexToRgb(pixels[i] ?? "#ffffff");
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = g;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [pixels, width, height]);

  // Fit and center the board when its size changes
  useLayoutEffect(() => {
    const el = containerRef.current; //hämtar inner boarden från browsern
    if (!el) return;
    const { clientWidth: cw, clientHeight: ch } = el;
    const scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, Math.floor(Math.min(cw / width, ch / height) * 0.9))
    );
    setView({ scale, x: (cw - width * scale) / 2, y: (ch - height * scale) / 2 });
  }, [width, height]);

  // Zoom towards the cursor (needs a non-passive listener to block page scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setView((v) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const k = scale / v.scale;
        return { scale, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function toPixel(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - view.x) / view.scale);
    const y = Math.floor((clientY - rect.top - view.y) / view.scale);
    return x >= 0 && y >= 0 && x < width && y < height ? { x, y } : null;
  }

  function updateHover(p: { x: number; y: number } | null) {
    setHover((prev) => (prev?.x === p?.x && prev?.y === p?.y ? prev : p));
    onHover?.(p);
  }

  return (
    <div
      ref={containerRef}
      className="board"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { 
          startX: e.clientX,
          startY: e.clientY,
          origX: view.x,
          origY: view.y,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) {
          const dx = e.clientX - d.startX;
          const dy = e.clientY - d.startY;
          if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) d.moved = true;
          if (d.moved) setView((v) => ({ ...v, x: d.origX + dx, y: d.origY + dy }));
        }
        updateHover(toPixel(e.clientX, e.clientY));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (d && !d.moved && !disabled) {
          const p = toPixel(e.clientX, e.clientY);
          if (p) onPlace(p.x, p.y);
        }
      }}
      onPointerLeave={() => updateHover(null)}
    >
      <div
        className="board-inner"
        style={{
          width,
          height,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        <canvas ref={canvasRef} width={width} height={height} />
      </div>
      {/* Positioned in screen pixels (outside the scaled layer) so the browser's
          rounding of tiny sizes doesn't get multiplied by the zoom level */}
      {hover && (
        <div
          className="hover-cell"
          style={{
            left: view.x + hover.x * view.scale,
            top: view.y + hover.y * view.scale,
            width: view.scale,
            height: view.scale,
            background: disabled ? "transparent" : selectedColor,
          }}
        />
      )}
    </div>
  );
}
